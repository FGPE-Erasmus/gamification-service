import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatus } from './models/challenge-status.model';
import { ChallengeStatusDto } from './dto/challenge-status.dto';

@Resolver()
export class ChallengeStatusResolver {
  constructor(private challengeStatusService: ChallengeStatusService) {}

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async get(
    @Args('playerId') playerId: string,
    @Args('challengeId') challengeId: string
  ): Promise<ChallengeStatusDto> {
    return this.challengeStatusService.findByChallengeIdAndPlayerId(challengeId, playerId);
  }
}
