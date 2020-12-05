import { CanActivate, ExecutionContext, HttpService, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Grant, Keycloak, Token } from 'keycloak-connect';
import { Request } from 'express';

import { appConfig } from '../../app.config';
import { getReq } from '../../common/utils/request.utils';
import { KEYCLOAK_INSTANCE, KEYCLOAK_OPTIONS } from '../keycloak.constants';
import { KeycloakOptions } from '../interfaces/keycloak-options.interface';
import { UserInfo } from '../interfaces/user-info.interface';
import { KeycloakRequest } from '../types/keycloak-request.type';
import authenticate from '../utils/authenticate.utils';

@Injectable()
export class AuthGuard implements CanActivate {
  protected readonly logger = new Logger(AuthGuard.name);

  constructor(
    @Inject(KEYCLOAK_INSTANCE) protected readonly keycloak: Keycloak,
    @Inject(KEYCLOAK_OPTIONS) protected readonly options: KeycloakOptions,
    protected readonly reflector: Reflector,
    protected readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('running auth guard ...');
    const req: KeycloakRequest = getReq(context);
    const isPublic = !!this.reflector.get<string>('public', context.getHandler());
    if (isPublic) return true;
    const roles = this.reflector.get<(string | string[])[]>('roles', context.getHandler());
    const accessToken = this.extractJwt(req) || req.session?.token;
    let grant: Grant | null = null;
    if (accessToken?.length) {
      grant = await this.getGrant(req, accessToken);
    } else if (req.session?.refreshToken) {
      grant = await this.getGrant(req);
    } else if (isPublic === false) return false;
    if (grant) {
      if (grant.isExpired()) return false;
      req.grant = grant;
      if (req.session?.userInfo) {
        req.userInfo = req.session.userInfo;
      } else {
        req.userInfo = await this.getUserInfo(req.grant);
        if (req.session) req.session.userInfo = req.userInfo;
      }
      if (roles && req.grant) {
        return roles.some(role => {
          return Array.isArray(role)
            ? role.every(innerRole => req.grant?.access_token?.hasRealmRole(innerRole))
            : req.grant?.access_token?.hasRealmRole(role);
        });
      }
      return true;
    }
    return false;
  }

  async getUserInfo(grant: Grant): Promise<UserInfo> {
    const userinfo =
      grant.access_token &&
      (await this.keycloak.grantManager.userInfo<
        Token | string,
        {
          email_verified: boolean;
          preferred_username: string;
          sub: string;
          [key: string]: any;
        }
      >(grant.access_token));
    const userInfo = {
      ...{
        emailVerified: userinfo?.email_verified,
        preferredUsername: userinfo?.preferred_username,
      },
      ...userinfo,
    } as UserInfo;
    delete userInfo?.email_verified;
    delete userInfo?.preferred_username;
    return userInfo;
  }

  async getGrant(req: KeycloakRequest, accessToken?: string): Promise<Grant | null> {
    const accessGrant = !!accessToken?.length;
    if (!accessToken && req.session?.refreshToken?.length) {
      try {
        const result = await authenticate(req, this.options, this.httpService, {
          refreshToken: req.session.refreshToken,
        });
        accessToken = result.accessToken;
        req.session.token = result.accessToken;
        req.session.refreshToken = result.refreshToken;
      } catch (err) {
        this.logger.error(err.statusCode, JSON.stringify(err.payload));
        if (err.statusCode < 500) return null;
        if (err.payload && err.statusCode) {
          this.logger.error(err.statusCode, JSON.stringify(err.payload));
        }
        throw err;
      }
    }
    if (!accessToken) return null;
    try {
      const grant = await this.keycloak.grantManager.createGrant({
        access_token: accessToken as any,
      });
      if (accessGrant && grant.isExpired()) {
        return this.getGrant(req);
      }
      return grant;
    } catch (err) {
      if (err.message !== 'Grant validation failed. Reason: invalid token (expired)') {
        throw err;
      }
      return this.getGrant(req);
    }
  }

  extractJwt(req: Request): string | null {
    if (req && req.cookies && req.cookies[appConfig.auth.keycloak.cookieKey]) {
      return req.cookies[appConfig.auth.keycloak.cookieKey];
    }
    const { authorization } = req.headers;
    if (typeof authorization === 'undefined') return null;
    if (authorization?.indexOf(' ') <= -1) return authorization;
    const auth = authorization?.split(' ');
    if (auth && auth[0] && auth[0].toLowerCase() === 'bearer') return auth[1];
    return null;
  }
}
