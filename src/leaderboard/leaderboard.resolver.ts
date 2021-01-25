import { Resolver, Query, ResolveField, Parent, Args, Subscription, Mutation } from '@nestjs/graphql';
import { Inject, NotFoundException, UseGuards } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions/dist/pubsub';

import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
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
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { NotificationEnum } from '../common/enums/notifications.enum';

@Resolver(() => LeaderboardDto)
export class LeaderboardResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly leaderboardToDtoMapper: LeaderboardToDtoMapper,
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [LeaderboardDto])
  async leaderboards(@Args('gameId') gameId: string): Promise<LeaderboardDto[]> {
    const leaderboards: Leaderboard[] = await this.leaderboardService.findByGameId(gameId);
    return Promise.all(leaderboards.map(async leaderboard => this.leaderboardToDtoMapper.transform(leaderboard)));
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => LeaderboardDto)
  async leaderboard(@Args('gameId') gameId: string, @Args('id') id: string): Promise<LeaderboardDto> {
    const leaderboard: Leaderboard = await this.leaderboardService.findById(id);
    if (!leaderboard || leaderboard.game !== gameId) {
      throw new NotFoundException();
    }
    return this.leaderboardToDtoMapper.transform(leaderboard);
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

  @Roles(Role.AUTHOR)
  @Subscription(() => LeaderboardDto)
  leaderboardModified(): AsyncIterator<LeaderboardDto> {
    return this.pubSub.asyncIterator(NotificationEnum.LEADERBOARD_MODIFIED);
  }
}
