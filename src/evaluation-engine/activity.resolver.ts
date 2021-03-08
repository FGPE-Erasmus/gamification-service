import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ActivityDto } from './dto/activity.dto';
import { ActivityService } from './activity.service';
import { Game } from '../game/models/game.model';
import { GameService } from '../game/game.service';

@Resolver(() => ActivityDto)
export class ActivityResolver {
  constructor(protected readonly gameService: GameService, protected readonly activityService: ActivityService) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [ActivityDto])
  async activities(@Args('gameId') gameId: string, @Args('challengeId') challengeId: string): Promise<ActivityDto[]> {
    const game: Game = await this.gameService.findById(gameId);
    return this.activityService.getActivities(game.courseId, challengeId);
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => ActivityDto)
  async activity(@Args('gameId') gameId: string, @Args('activityId') activityId: string): Promise<ActivityDto> {
    const game: Game = await this.gameService.findById(gameId);
    return this.activityService.getActivity(game.courseId, activityId);
  }
}
