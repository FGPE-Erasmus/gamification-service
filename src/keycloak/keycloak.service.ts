import { HttpService, Inject, Injectable, Scope } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Grant, Keycloak } from 'keycloak-connect';

import { LoginArgs } from './args/login.args';
import { AuthDto } from './dto/auth.dto';
import { KEYCLOAK_INSTANCE, KEYCLOAK_OPTIONS } from './keycloak.constants';
import { KeycloakOptions } from './interfaces/keycloak-options.interface';
import { UserInfo } from './interfaces/user-info.interface';
import { KeycloakRequest } from './types/keycloak-request.type';
import authenticate from './utils/authenticate.utils';

@Injectable({ scope: Scope.REQUEST })
export class KeycloakService {
  constructor(
    @Inject(KEYCLOAK_INSTANCE) private readonly _keycloak: Keycloak,
    @Inject(KEYCLOAK_OPTIONS) private readonly options: KeycloakOptions,
    @Inject(REQUEST) private readonly req: KeycloakRequest<Request>,
    private readonly httpService: HttpService,
  ) {}

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
}
