import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { ProgrammingLanguageDto } from './dto/programming-language.dto';
import { EvaluationEngineService } from './evaluation-engine.service';

@Resolver(() => ProgrammingLanguageDto)
export class ProgrammingLanguageResolver {
  constructor(protected readonly evaluationEngineService: EvaluationEngineService) {}

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [ProgrammingLanguageDto])
  async programmingLanguages(@Args('gameId') gameId: string): Promise<ProgrammingLanguageDto[]> {
    return this.evaluationEngineService.getProgrammingLanguages(gameId);
  }

  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => ProgrammingLanguageDto)
  async programmingLanguage(
    @Args('gameId') gameId: string,
    @Args('languageId') languageId: string,
  ): Promise<ProgrammingLanguageDto> {
    return this.evaluationEngineService.getProgrammingLanguage(gameId, languageId);
  }
}
