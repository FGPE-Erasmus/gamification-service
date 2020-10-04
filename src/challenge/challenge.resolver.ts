import { UseGuards } from '@nestjs/common';
import { Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { GameService } from '../game/game.service';
import { ChallengeService } from './challenge.service';
import { Challenge } from './models/challenge.model';
import { ChallengeDto } from './dto/challenge.dto';
import { GameDto } from '../game/dto/game.dto';

@Resolver(() => Challenge)
export class ChallengeResolver {

  constructor(
    private readonly challengeService: ChallengeService,
    private readonly gameService: GameService
  ) {}

  @Query(() => [Challenge])
  @UseGuards(GqlJwtAuthGuard)
  async challenges(): Promise<ChallengeDto[]> {
    return this.challengeService.findAll();
  }

  @ResolveField()
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
  }
}
