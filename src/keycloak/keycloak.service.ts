import { HttpException, HttpService, Inject, Injectable, NotFoundException, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Grant, Keycloak } from 'keycloak-connect';

import { LoginArgs } from './args/login.args';
import { AuthDto } from './dto/auth.dto';
import { KEYCLOAK_INSTANCE, KEYCLOAK_OPTIONS } from './keycloak.constants';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { UserInfo } from './interfaces/user-info.interface';
import { KeycloakRequest } from './types/keycloak-request.type';
import authenticate from './utils/authenticate.utils';
import { AxiosResponse } from 'axios';
import * as qs from 'qs';
import { appConfig } from '../app.config';
import { User } from './interfaces/user.interface';
import { UserDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';

@Injectable({ scope: Scope.REQUEST })
export class KeycloakService {
  protected readonly realmUrl: string;

  constructor(
    @Inject(KEYCLOAK_INSTANCE) private readonly _keycloak: Keycloak,
    @Inject(KEYCLOAK_OPTIONS) private readonly options: KeycloakOptions,
    @Inject(REQUEST) private readonly req: KeycloakRequest,
    private readonly httpService: HttpService,
  ) {
    this.realmUrl = `${this.options.authServerUrl}/admin/realms/${this.options.realm}`;
  }

  async authenticate(loginArgs: LoginArgs): Promise<AuthDto> {
    return authenticate(this.req, this.options, this.httpService, loginArgs);
  }

  async logout(): Promise<null> {
    if (!this.req.session) return null;
    await new Promise<void>((resolve, reject) => {
      if (!this.req.session?.destroy) return resolve();
      this.req.session?.destroy((err: Error) => {
        if (err) return reject(err);
        return resolve();
      });
    });
    return null;
  }

  get userInfo(): UserInfo | undefined {
    return this.req.userInfo;
  }

  get grant(): Grant | undefined {
    return this.req.grant;
  }

  async getUsers(): Promise<UserDto[]> {
    const response: AxiosResponse<User[]> = await this.httpService
      .get<User[]>(`${this.realmUrl}/users`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return response.data.map(user => ({
      firstName: user.given_name,
      lastName: user.family_name,
      ...user,
    }));
  }

  async getUser(userId: string): Promise<UserDto> {
    const response: AxiosResponse<User> = await this.httpService
      .get<User>(`${this.realmUrl}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status === 404) {
      throw new NotFoundException();
    } else if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return {
      firstName: response.data.given_name,
      lastName: response.data.family_name,
      ...response.data,
    };
  }

  async getUsersByRole(role: Role): Promise<UserDto[]> {
    const response: AxiosResponse<User[]> = await this.httpService
      .get<User[]>(`${this.realmUrl}/roles/${role.toLowerCase()}/users`, {
        headers: {
          Authorization: `Bearer ${(await this.getAccessToken()).data.access_token}`,
        },
      })
      .toPromise();
    if (response.status > 299) {
      throw new HttpException(response.data, response.status);
    }
    return response.data.map(user => ({
      firstName: user.given_name,
      lastName: user.family_name,
      ...user,
    }));
  }

  private async getAccessToken(): Promise<AxiosResponse> {
    return this.httpService
      .post(
        `${this.options.authServerUrl}/realms/${this.options.realm}/protocol/openid-connect/token`,
        qs.stringify({
          client_id: 'admin-cli',
          grant_type: 'password',
          username: appConfig.auth.keycloak.adminUsername,
          password: appConfig.auth.keycloak.adminPassword,
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      )
      .toPromise();
  }
}
