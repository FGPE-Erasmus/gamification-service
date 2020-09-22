import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameService } from '../game/game.service';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookDto } from './dto/scheduled-hook.dto';
import { ScheduledHookEntity as ScheduledHook } from './entities/scheduled-hook.entity';

@Resolver(() => ScheduledHook)
export class ScheduledHookResolver {
  constructor(
    private readonly scheduledHookService: ScheduledHookService,
    private readonly gameService: GameService,
    private readonly challengeService: ChallengeService,
  ) {}

  @Query(() => [ScheduledHookDto])
  @UseGuards(GqlJwtAuthGuard)
  async scheduledHooks(): Promise<ScheduledHookDto[]> {
    return this.scheduledHookService.findAll();
  }

  @ResolveProperty()
  async game(@Parent() root: ScheduledHook): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: ScheduledHook): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
