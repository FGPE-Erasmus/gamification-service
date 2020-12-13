import { CanActivate, ExecutionContext, Injectable, Logger, Scope } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES } from '../../keycloak/decorators/roles.decorator';
import { difference } from '../utils/array.utils';
import { getGameId, getReq } from '../utils/request.utils';
import { Role } from '../enums/role.enum';
import { GameService } from '../../game/game.service';
import { GAME_KEY_EXTRACTOR } from '../decorators/game-key-extractor.decorator';
import { KeycloakRequest } from '../../keycloak/types/keycloak-request.type';

/**
 * Check if the user is instructor in the same game as the one passed in the
 * request.
 */
@Injectable({ scope: Scope.REQUEST })
export class GqlInstructorAssignedGuard implements CanActivate {
  protected readonly logger = new Logger(GqlInstructorAssignedGuard.name);

  constructor(protected readonly gameService: GameService, protected readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('running instructor assigned to game guard ...');
    const request: KeycloakRequest = getReq(context);
    // if it is not a teacher, bypass the check
    if (!request.grant?.access_token?.hasRealmRole(Role.TEACHER)) {
      this.logger.debug('not a teacher, bypassing guard ...');
      return true;
    }
    // is there a role that bypasses this check
    const roles = this.reflector.get<(string | string[])[]>(ROLES, context.getHandler());
    const rolesWithDirectAccess = difference(roles, [Role.TEACHER]);
    for (const roleName of rolesWithDirectAccess) {
      if (request.grant?.access_token?.hasRealmRole(roleName)) {
        this.logger.debug('has a role that does not require this check, bypassing guard ...');
        return true;
      }
    }
    // needs to be instructor in game
    const extractorFn = this.reflector.get<(context: ExecutionContext) => string>(
      GAME_KEY_EXTRACTOR,
      context.getHandler(),
    );
    const gameId = getGameId(context, extractorFn);
    return (
      request.userInfo && request.userInfo.sub && gameId && this.gameService.isInstructor(gameId, request.userInfo.sub)
    );
  }
}
