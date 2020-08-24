import { Resolver, Query, Args } from '@nestjs/graphql';
import { HintService } from './hint.service';
import { HintEntity as Hint } from './entities/hint.entity';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';

@Resolver()
export class HintResolver {
  constructor(readonly hintService: HintService) {}

  @Query(() => [Hint])
  @UseGuards(GqlJwtAuthGuard)
  async hint(@GqlUser('id') playerId: string, @Args('exerciseId') exerciseId: string): Promise<Hint[]> {
    return await this.hintService.getHint(playerId, exerciseId);
  }
}
