import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameDto } from '../game/dto/game.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { GameService } from '../game/game.service';
import { ChallengeService } from './challenge.service';
import { ChallengeDto } from './dto/challenge.dto';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { Challenge } from './models/challenge.model';

@Resolver(() => ChallengeDto)
export class ChallengeResolver {
  constructor(
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
  ) {}

  @Query(() => [ChallengeDto])
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async challenges(@Args('gameId') gameId: string): Promise<ChallengeDto[]> {
    const challenges: Challenge[] = await this.challengeService.findByGameId(gameId);
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: ChallengeDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField('parentChallenge', () => ChallengeDto)
  async parentChallenge(@Parent() root: ChallengeDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }
}
