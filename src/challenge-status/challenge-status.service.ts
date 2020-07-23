import { Injectable } from '@nestjs/common';
import { State } from './entities/state.enum';
import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';

@Injectable()
export class ChallengeStatusService {
  /**
   * Creates a challenge status for locked na hidden statuses
   * @param studentId a student id
   * @param challenge a challenge student has taken up.
   */
  async createStatus(studentId: string, challengeId: string, state: State): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: new Date(),
      endedAt: undefined,
      state: [state],
      openedAt: undefined,
    };
    return status;
  }

  async markAsOpen(studentId: string, challengeId: string, startedDate: Date, date: Date): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: startedDate,
      endedAt: undefined,
      state: [State.OPENED],
      openedAt: date,
    };

    return status;
  }

  async markAsFailed(
    studentId: string,
    challengeId: string,
    startedDate: Date,
    openedDate: Date,
    date: Date,
  ): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: startedDate,
      endedAt: date,
      state: [State.FAILED],
      openedAt: openedDate,
    };

    return status;
  }

  async markAsCompleted(
    studentId: string,
    challengeId: string,
    startedDate: Date,
    endedDate: Date,
    date: Date,
  ): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: startedDate,
      endedAt: endedDate,
      state: [State.COMPLETED],
      openedAt: date,
    };
    return status;
  }

  async markAsRejected(
    studentId: string,
    challengeId: string,
    startedDate: Date,
    endedDate: Date,
    date: Date,
  ): Promise<ChallengeStatus> {
    const status: ChallengeStatus = {
      startedAt: startedDate,
      endedAt: endedDate,
      state: [State.REJECTED],
      openedAt: date,
    };
    return status;
  }
}
