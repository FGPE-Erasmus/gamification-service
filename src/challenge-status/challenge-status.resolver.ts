// import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
// import { UseGuards } from '@nestjs/common';

// import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
// import { ChallengeStatusService } from './challenge-status.service';
// import { ChallengeStatusEntity } from './entities/challenge-status.entity';
// import { ChallengeEntity as Challenge } from 'src/challenge/entities/challenge.entity';
// import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';
// import { State } from './entities/state.enum';

// @Resolver()
// export class ChallengeStatusResolver {
//   constructor(private challengeStatusService: ChallengeStatusService) {}

//   @Query()
//   @UseGuards(GqlJwtAuthGuard)
//   async create(@Args() input: Challenge, studentId: string): Promise<ChallengeStatusEntity> {
//     return this.challengeStatusService.createStatus(studentId, input);
//   }

//   @Query()
//   @UseGuards(GqlJwtAuthGuard)
//   async update(
//     @Args() input: ChallengeStatus,
//     studentId: string,
//     status: State,
//     date: Date,
//   ): Promise<ChallengeStatusEntity> {
//     switch (status) {
//       case State.OPENED:
//         return this.challengeStatusService.markAsOpen(studentId, input, date);
//       case State.FAILED:
//         return this.challengeStatusService.markAsFailed(studentId, input);
//       case State.COMPLETED:
//         return this.challengeStatusService.markAsCompleted(studentId, input, date);
//       case State.REJECTED:
//         return this.challengeStatusService.markAsRejected(studentId, input);
//     }
//   }
// }
