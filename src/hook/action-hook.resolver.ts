import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveProperty, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameService } from '../game/game.service';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { ActionHookService } from './action-hook.service';
import { ActionHookDto } from './dto/action-hook.dto';
import { ActionHookEntity as ActionHook } from './entities/action-hook.entity';

@Resolver(() => ActionHook)
export class ActionHookResolver {
  constructor(
    private readonly actionHookService: ActionHookService,
    private readonly gameService: GameService,
    private readonly challengeService: ChallengeService,
  ) {}

  @Query(() => [ActionHookDto])
  @UseGuards(GqlJwtAuthGuard)
  async actionHooks(): Promise<ActionHookDto[]> {
    return this.actionHookService.findAll();
  }

  @ResolveProperty()
  async game(@Parent() root: ActionHook): Promise<Game> {
    const { game } = root;
    return await this.gameService.findOne(game);
  }

  @ResolveProperty()
  async parentChallenge(@Parent() root: ActionHook): Promise<Challenge | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne(parentChallenge);
  }
}
