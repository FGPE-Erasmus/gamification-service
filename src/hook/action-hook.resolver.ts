import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { ActionHookService } from './action-hook.service';
import { ActionHookDto } from './dto/action-hook.dto';

@Resolver(() => ActionHookDto)
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

  /*@ResolveProperty()
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
  }*/
}
