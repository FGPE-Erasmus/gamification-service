import { Resolver, Args, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeStatusService } from './challenge-status.service';
import { State } from './entities/state.enum';
import UpdateChallengeStatus from './dto/update-challenge-status.dto';

@Resolver()
export class ChallengeStatusResolver {
  constructor(private challengeStatusService: ChallengeStatusService) {}

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async create(
    @Args('studentId') studentId: string,
    @Args('challengeId') challengeId: string,
  ): Promise<ChallengeStatus> {
    return this.challengeStatusService.createStatus(studentId, challengeId);
  }

  @Query(() => ChallengeStatus)
  @UseGuards(GqlJwtAuthGuard)
  async update(@Args() update: UpdateChallengeStatus): Promise<ChallengeStatus> {
    switch (status) {
      case State.OPENED:
        return this.challengeStatusService.markAsOpen(update.studentId, update.challengeId, update.date);
      case State.FAILED:
        return this.challengeStatusService.markAsFailed(update.studentId, update.challengeId, update.date);
      case State.COMPLETED:
        return this.challengeStatusService.markAsCompleted(update.studentId, update.challengeId, update.date);
      case State.REJECTED:
        return this.challengeStatusService.markAsRejected(update.studentId, update.challengeId, update.date);
    }
  }
}
