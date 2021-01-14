import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { GameDto } from '../game/dto/game.dto';
import { GameService } from '../game/game.service';
import { ActivityDto } from './dto/activity.dto';
import { ActivityService } from './activity.service';
import { ActivityStatusDto } from './dto/activity-status.dto';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';

@Resolver(() => ActivityStatusDto)
export class ActivityStatusResolver {
  constructor(
    protected readonly gameService: GameService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    protected readonly activityService: ActivityService,
  ) {}

  @Roles(Role.AUTHOR, Role.TEACHER)
  @UseGuards(GqlInstructorAssignedGuard)
  @Query(() => ActivityStatusDto)
  async activityStatus(
    @Args('gameId') gameId: string,
    @Args('activityId') activityId: string,
    @Args('playerId') playerId: string,
  ): Promise<ActivityDto> {
    return this.activityService.getActivityStatus(gameId, activityId, playerId);
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => ActivityStatusDto)
  async myActivityStatus(
    @GqlPlayer('id') playerId: string,
    @Args('gameId') gameId: string,
    @Args('activityId') activityId: string,
  ): Promise<ActivityDto> {
    return this.activityService.getActivityStatus(gameId, activityId, playerId);
  }

  @ResolveField('activity', () => ActivityDto)
  async activity(@Parent() root: ActivityStatusDto): Promise<ActivityDto> {
    const { game: gameId, activity: activityId } = root;
    return this.activityService.getActivity(gameId, activityId);
  }

  @ResolveField('game', () => GameDto)
  async game(@Parent() root: ChallengeDto): Promise<GameDto> {
    const { game: gameId } = root;
    const game = await this.gameService.findById(gameId);
    return this.gameToDtoMapper.transform(game);
  }
}
