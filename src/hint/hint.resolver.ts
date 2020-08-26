import { Resolver, Query, Args } from '@nestjs/graphql';
import { HintService } from './hint.service';
import { HintEntity as Hint } from './entities/hint.entity';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlAdminGuard } from 'src/common/guards/gql-admin.guard';
import { GqlEnrolledInGame } from 'src/common/guards/gql-game-enrollment.guard';

@Resolver()
export class HintResolver {
  constructor(readonly hintService: HintService) {}

  @Query(() => [Hint])
  @UseGuards(GqlAdminGuard)
  async playerHints(@Args('id') playerId: string, @Args('exerciseId') exerciseId: string): Promise<Hint[]> {
    return await this.hintService.getPlayersHintsForExercise(playerId, exerciseId);
  }

  @Query(() => [Hint])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async exerciseHints(@Args('exerciseId') exerciseId: string): Promise<Hint[]> {
    return await this.hintService.getHintsForExercise(exerciseId);
  }
}
