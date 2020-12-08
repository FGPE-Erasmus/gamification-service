import { Reflector } from '@nestjs/core';
import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Keycloak } from 'keycloak-connect';

import { RESOURCE } from '../decorators/resource.decorator';
import { SCOPES } from '../decorators/scopes.decorator';
import { KEYCLOAK_INSTANCE } from '../keycloak.constants';
import { getReq } from '../../common/utils/request.utils';
import { KeycloakRequest } from '../types/keycloak-request.type';

declare module 'keycloak-connect' {
  interface Keycloak {
    enforcer(expectedPermissions: string | string[]): (req: any, res: any, next: any) => any;
  }
}

@Injectable()
export class ResourceGuard implements CanActivate {
  protected readonly logger = new Logger(ResourceGuard.name);

  constructor(
    @Inject(KEYCLOAK_INSTANCE) protected readonly keycloak: Keycloak,
    protected readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resource = this.reflector.get<string>(RESOURCE, context.getClass());
    const scopes = this.reflector.get<string[]>(SCOPES, context.getHandler()) || [];
    if (!resource || !scopes.length) return true;
    this.logger.verbose(`Protecting resource '${resource}' with scopes: [ ${scopes} ]`);
    if (!scopes.length) return true;
    const req: KeycloakRequest = getReq(context);
    if (!req.userInfo) return false;
    const permissions = scopes.map(scope => `${resource}:${scope}`);
    const res: Response = context.switchToHttp().getResponse();
    const username = req.userInfo?.preferred_username;
    const enforcerFn = createEnforcerContext(req, res);
    const isAllowed = await enforcerFn(this.keycloak, permissions);
    if (!isAllowed) {
      this.logger.verbose(`Resource '${resource}' denied to '${username}'.`);
      return false;
    }
    this.logger.verbose(`Resource '${resource}' granted to '${username}'.`);
    return true;
  }
}

function createEnforcerContext(req: any, res: any) {
  req.kauth = { grant: req.grant };
  return (keycloak: Keycloak, permissions: string[]) => {
    return new Promise<boolean>(resolve => {
      return keycloak.enforcer(permissions)(req, res, (_next: any) => {
        if (req.resourceDenied) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  };
}
