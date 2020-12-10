import { Injectable, CanActivate, ExecutionContext, Logger, Scope } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES } from '../../keycloak/decorators/roles.decorator';
import { KeycloakRequest } from '../../keycloak/types/keycloak-request.type';
import { PlayerService } from '../../player/player.service';
import { GAME_KEY_EXTRACTOR } from '../decorators/game-key-extractor.decorator';
import { Role } from '../enums/role.enum';
import { difference } from '../utils/array.utils';
import { getGameId, getReq } from '../utils/request.utils';
import { Player } from '../../player/models/player.model';

/**
 * Check if the player is enrolled in the same game as the one passed in the
 * request.
 */
@Injectable({ scope: Scope.REQUEST })
export class GqlPlayerOfGuard implements CanActivate {
  protected readonly logger = new Logger(GqlPlayerOfGuard.name);

  constructor(protected readonly playerService: PlayerService, protected readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('running player of game guard ...');
    const request: KeycloakRequest = getReq(context);
    // if it is not a student, bypass the check
    if (!request.grant?.access_token?.hasRealmRole(Role.STUDENT)) {
      this.logger.debug('not a student, bypassing guard ...');
      return true;
    }
    // is there a role that bypasses this check
    const roles = this.reflector.get<(string | string[])[]>(ROLES, context.getHandler());
    const rolesWithDirectAccess = difference(roles, [Role.STUDENT]);
    for (const roleName of rolesWithDirectAccess) {
      if (request.grant?.access_token?.hasRealmRole(roleName)) {
        this.logger.debug('has a role that does not require this check, bypassing guard ...');
        return true;
      }
    }
    // needs to be a player of the game
    const extractorFn = this.reflector.get<(context: ExecutionContext) => string>(
      GAME_KEY_EXTRACTOR,
      context.getHandler(),
    );
    const gameId = getGameId(context, extractorFn);
    if (!request.userInfo || !request.userInfo.sub || !gameId) {
      return false;
    }
    const player: Player = await this.playerService.findByGameAndUser(gameId, request.userInfo.sub);
    console.log(player);
    if (!player) {
      return false;
    }
    (request as any).player = player;
    /*if ( isGraphQL(context) ) {
      GqlExecutionContext.create(context).getContext().req.player = player;
    } else {
    }*/
    return true;
  }
}
