import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeStatusService } from './challenge-status.service';

@Resolver()
export class ChallengeStatusResolver {
  constructor(private challengeStatusService: ChallengeStatusService) {}

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async get(@Args('studentId') studentId: string, @Args('challngeId') challengeId: string): Promise<ChallengeStatus> {
    return this.challengeStatusService.getStatus(studentId, challengeId);
  }
}
