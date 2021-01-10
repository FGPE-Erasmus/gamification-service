import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ProgrammingLanguageDto } from './dto/programming-language.dto';
import { EvaluationEngineService } from './evaluation-engine.service';
import { ActivityDto } from './dto/activity.dto';
import { ActivityService } from './activity.service';

@Resolver(() => ActivityDto)
export class ActivityResolver {
  constructor(protected readonly activityService: ActivityService) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [ActivityDto])
  async activities(@Args('gameId') gameId: string, @Args('challengeId') challengeId: string): Promise<ActivityDto[]> {
    return this.activityService.getActivities(gameId, challengeId);
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => ActivityDto)
  async activity(@Args('gameId') gameId: string, @Args('activityId') activityId: string): Promise<ActivityDto> {
    return this.activityService.getActivity(gameId, activityId);
  }
}
