import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeStatusService } from './challenge-status.service';
import { State } from './entities/state.enum';

@Resolver()
export class ChallengeStatusResolver {
  constructor(private challengeStatusService: ChallengeStatusService) {}

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async create(@Args() studentId: string, challengeId: string): Promise<ChallengeStatus> {
    return this.challengeStatusService.createStatus(studentId, challengeId).catch(e => {
      console.log(e);
      throw e;
    });
  }

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async update(
    @Args()
    studentId: string,
    challengeId: string,
    status: State,
    date: Date,
  ): Promise<ChallengeStatus> {
    switch (status) {
      case State.OPENED:
        return this.challengeStatusService.markAsOpen(studentId, challengeId, date);
      case State.FAILED:
        return this.challengeStatusService.markAsFailed(studentId, challengeId, date);
      case State.COMPLETED:
        return this.challengeStatusService.markAsCompleted(studentId, challengeId, date);
      case State.REJECTED:
        return this.challengeStatusService.markAsRejected(studentId, challengeId, date);
    }
  }
}
