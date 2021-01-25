import { CanActivate, ExecutionContext, Injectable, Logger, Scope } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { KeycloakRequest } from '../../keycloak/types/keycloak-request.type';
import { PlayerService } from '../../player/player.service';
import { Role } from '../enums/role.enum';
import { getReq } from '../utils/request.utils';

@Injectable({ scope: Scope.REQUEST })
export class GqlRequestedPlayerGuard implements CanActivate {
  protected readonly logger = new Logger(GqlRequestedPlayerGuard.name);

  constructor(protected readonly playerService: PlayerService, protected readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const playerArg = context.getArgByIndex(1).playerId;
    const request: KeycloakRequest = getReq(context);

    if (!request.grant?.access_token?.hasRealmRole(Role.STUDENT)) {
      this.logger.debug('not a student, bypassing guard ...');
      return true;
    }

    if (request['player'] && request['player']['id'] === playerArg) return true;
    else return false;
  }
}
