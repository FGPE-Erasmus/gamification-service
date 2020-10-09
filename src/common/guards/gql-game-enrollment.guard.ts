import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { PlayerService } from '../../player/player.service';
import { User } from '../../users/models/user.model';

/**
 * Check if the user is enrolled into the same game as the one passed in the request
 */
@Injectable()
export class GqlEnrolledInGame implements CanActivate {
  constructor(protected readonly playerService: PlayerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const gameId = ctx.getArgs()['gameId'];
    if (request.user) {
      const user = request.user as User;
      const player = await this.playerService.findByGameAndUser(gameId, user.id);
      if (!player) {
        return false;
      }
      request.player = player;
      return true;
    }
  }
}
