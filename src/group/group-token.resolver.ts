import { Args, GqlExecutionContext, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GameKeyExtractor } from '../common/decorators/game-key-extractor.decorator';
import { TokenDto } from '../common/dto/token.dto';
import { GroupService } from './group.service';

@Resolver(() => TokenDto)
export class GroupTokenResolver {
  constructor(protected readonly groupService: GroupService) {}

  @Roles(Role.TEACHER)
  @GameKeyExtractor(context => (context as GqlExecutionContext).getArgs()['gameId'])
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => TokenDto)
  async generateGroupToken(@Args('gameId') gameId: string, @Args('groupId') groupId: string): Promise<TokenDto> {
    return this.groupService.generateGroupToken(gameId, groupId);
  }
}
