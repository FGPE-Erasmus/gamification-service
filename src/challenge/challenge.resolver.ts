import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameService } from '../game/game.service';
import { ChallengeService } from './challenge.service';
import { ChallengeDto } from './dto/challenge.dto';

@Resolver(() => ChallengeDto)
export class ChallengeResolver {
  constructor(private readonly challengeService: ChallengeService, private readonly gameService: GameService) {}

  @Query(() => [ChallengeDto])
  @UseGuards(GqlJwtAuthGuard)
  async challenges(): Promise<ChallengeDto[]> {
    return this.challengeService.findAll();
  }

  /*@ResolveField()
  async game(@Parent() root: Challenge): Promise<GameDto> {
    const { game } = root;
    return await this.gameService.findById(game);
  }

  @ResolveField()
  async parentChallenge(@Parent() root: Challenge): Promise<ChallengeDto | undefined> {
    const { parentChallenge } = root;
    if (!parentChallenge) {
      return;
    }
    return await this.challengeService.findOne({ parentChallenge });
  }*/
}
