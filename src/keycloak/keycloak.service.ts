import { HttpService, Inject, Injectable, Logger, LoggerService, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Grant } from 'keycloak-connect';

import { LoginArgs } from './args/login.args';
import { AuthDto } from './dto/auth.dto';
import { KEYCLOAK_OPTIONS } from './keycloak.constants';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { UserInfo } from './interfaces/user-info.interface';
import { KeycloakRequest } from './types/keycloak-request.type';
import authenticate from './utils/authenticate.utils';

@Injectable({ scope: Scope.REQUEST })
export class KeycloakService {
  protected readonly logger: LoggerService;
  protected readonly realmUrl: string;

  constructor(
    @Inject(KEYCLOAK_OPTIONS) private readonly options: KeycloakOptions,
    @Inject(REQUEST) private readonly req: KeycloakRequest,
    private readonly httpService: HttpService,
  ) {
    this.logger = new Logger(KeycloakService.name);
    this.realmUrl = `${this.options.authServerUrl}/admin/realms/${this.options.realm}`;
  }

  async authenticate(loginArgs: LoginArgs): Promise<AuthDto> {
    return authenticate(this.req, this.options, this.httpService, loginArgs);
  }

  async ltiLogin(token: any, body: any): Promise<any> {
    //const role = token.platformContext.roles;
    this.logger.log(JSON.stringify(token));
    this.logger.log(JSON.stringify(body));
    return {
      status: 'ok',
    };
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
}
