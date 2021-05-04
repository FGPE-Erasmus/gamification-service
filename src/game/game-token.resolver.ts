import { Args, GqlExecutionContext, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GameService } from './game.service';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GameKeyExtractor } from '../common/decorators/game-key-extractor.decorator';
import { TokenDto } from '../common/dto/token.dto';

@Resolver(() => TokenDto)
export class GameTokenResolver {
  constructor(protected readonly gameService: GameService, protected readonly gameToDtoMapper: GameToDtoMapper) {}

  @Roles(Role.TEACHER)
  @GameKeyExtractor(context => (context as GqlExecutionContext).getArgs()['id'])
  @UseGuards(GqlInstructorAssignedGuard)
  @Mutation(() => TokenDto)
  async generateGameToken(@Args('id') id: string): Promise<TokenDto> {
    return this.gameService.generateEnrollToken(id);
  }
}
