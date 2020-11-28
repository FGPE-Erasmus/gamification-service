import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeService } from '../challenge/challenge.service';
import { GameService } from '../game/game.service';
import { GameDto } from '../game/dto/game.dto';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { ActionHookService } from './action-hook.service';
import { ActionHookDto } from './dto/action-hook.dto';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ActionHook } from './models/action-hook.model';

@Resolver(() => ActionHookDto)
export class ActionHookResolver {
  constructor(
    protected readonly actionHookService: ActionHookService,
    protected readonly actionHookToDtoMapper: ActionHookToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {}

  @Query(() => [ActionHookDto])
  @UseGuards(GqlJwtAuthGuard)
  async actionHooks(@Args('gameId') gameId: string): Promise<ActionHookDto[]> {
    const hooks: ActionHook[] = await this.actionHookService.findByGameId(gameId);
    return Promise.all(hooks.map(async hook => this.actionHookToDtoMapper.transform(hook)));
  }

  @ResolveField()
  async game(@Parent() root: ActionHookDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async parentChallenge(@Parent() root: ActionHookDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }
}
