import { Resolver, Query, ResolveField, Parent, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { GameDto } from '../game/dto/game.dto';
import { ChallengeService } from '../challenge/challenge.service';
import { ChallengeToDtoMapper } from '../challenge/mappers/challenge-to-dto.mapper';
import { GameService } from '../game/game.service';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { Leaderboard } from './models/leaderboard.model';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';

@Resolver(() => LeaderboardDto)
export class LeaderboardResolver {
  constructor(
    protected readonly leaderboardService: LeaderboardService,
    protected readonly leaderboardToDtoMapper: LeaderboardToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {}

  @Query(() => [LeaderboardDto])
  @UseGuards(GqlJwtAuthGuard)
  async leaderboards(@Args('gameId') gameId: string): Promise<LeaderboardDto[]> {
    const leaderboards: Leaderboard[] = await this.leaderboardService.findByGameId(gameId);
    return Promise.all(leaderboards.map(async leaderboard => this.leaderboardToDtoMapper.transform(leaderboard)));
  }

  @ResolveField()
  async game(@Parent() root: LeaderboardDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }

  @ResolveField()
  async parentChallenge(@Parent() root: LeaderboardDto): Promise<ChallengeDto | undefined> {
    const { parentChallenge: parentChallengeId } = root;
    if (!parentChallengeId) {
      return;
    }
    const parentChallenge = await this.challengeService.findById(parentChallengeId);
    return this.challengeToDtoMapper.transform(parentChallenge);
  }
}
