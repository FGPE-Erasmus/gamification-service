import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';
import { PlayerRepository } from 'src/player/repositories/player.repository';

/**
 * Check if the user is enrolled into the same game as the one passed in the request
 */

@Injectable()
export class GqlEnrolledInGame implements CanActivate {
  constructor(private playerRepository: PlayerRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const gameId = ctx.getArgs()['gameId'];
    if (request.user) {
      const user = request.user as User;
      const player = await this.playerRepository.findOne({
        user: user.id,
        game: gameId,
      });
      if (!player) throw new Error('Player is not enrolled in this game.');
      request.player = player;
      return true;
    }
  }
}
