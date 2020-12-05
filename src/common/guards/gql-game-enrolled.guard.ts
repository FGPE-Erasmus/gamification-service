import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlayerService } from '../../player/player.service';
import { ROLES } from '../../keycloak/decorators/roles.decorator';
import { UserInfo } from '../../keycloak/interfaces/user-info.interface';
import { ROLES_REQUIRING_ENROLLMENT } from '../decorators/roles-requiring-enrollment.decorator';
import { difference } from '../utils/array.utils';
import { isGraphQL } from '../utils/request.utils';

/**
 * Check if the user is enrolled in the same game as the one passed in the
 * request if their roles matches the ones passed in.
 */
@Injectable()
export class GqlGameEnrolledGuard implements CanActivate {
  protected readonly logger = new Logger(GqlGameEnrolledGuard.name);

  constructor(protected readonly playerService: PlayerService, protected readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    this.logger.debug('running enrolled in game guard ...');
    if (!isGraphQL(context)) {
      return true;
    }
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const roles = this.reflector.get<(string | string[])[]>(ROLES, context.getHandler());
    const [key, ...rolesIfEnrolled] = this.reflector.get<(string | string[])[]>(
      ROLES_REQUIRING_ENROLLMENT,
      context.getHandler(),
    );
    if (!rolesIfEnrolled || !rolesIfEnrolled.length) {
      return true;
    }
    // is there a role that bypasses this check
    const rolesWithoutEnrolment = difference(roles, rolesIfEnrolled);
    for (const roleName of rolesWithoutEnrolment) {
      if (request.grant?.access_token?.hasRealmRole(roleName)) {
        return true;
      }
    }
    // needs to be enrolled in game
    const gameId = ctx.getArgs()[key as string];
    if (request.userInfo) {
      const userInfo = request.userInfo as UserInfo;
      const player = await this.playerService.findByGameAndUser(gameId, userInfo.sub);
      if (!player) {
        return false;
      }
      request.player = player;
      return true;
    }
  }
}
