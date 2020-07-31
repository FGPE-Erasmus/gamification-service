import { Injectable } from '@nestjs/common';
import { State } from './entities/state.enum';
import { ChallengeStatusEntity as ChallengeStatus } from './entities/challenge-status.entity';
import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';

@Injectable()
export class ChallengeStatusService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly challengeStatusRepository: ChallengeStatusRepository,
  ) {}

  /**
   * Creates a challenge status for locked and hidden statuses
   * @param studentId a student id
   * @param challenge a challenge student has taken up.
   */
  async createStatus(studentId: string, challengeId: string): Promise<ChallengeStatus> {
    const status = {
      studentId: studentId,
      challengeId: challengeId,
      state: [State.LOCKED], //the default one?
    };

    const newStatus: ChallengeStatus = await this.serviceHelper.getUpsertData(
      undefined,
      { ...status },
      this.challengeStatusRepository,
    );
    return this.challengeStatusRepository.save(newStatus);
  }

  async getStatus(studentId: string, challengeId: string): Promise<ChallengeStatus> {
    return await this.challengeStatusRepository.findStatus(studentId, challengeId);
  }

  async markAsOpen(studentId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp = await this.challengeStatusRepository.findStatus(studentId, challengeId);
    temp.state = [State.OPENED];
    temp.openedAt = date;
    return this.challengeStatusRepository.save(temp);
  }

  async markAsFailed(studentId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp = await this.challengeStatusRepository.findStatus(studentId, challengeId);
    temp.state = [State.FAILED];
    temp.endedAt = date;
    return this.challengeStatusRepository.save(temp);
  }

  async markAsCompleted(studentId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp = await this.challengeStatusRepository.findStatus(studentId, challengeId);
    temp.state = [State.COMPLETED];
    temp.endedAt = date;
    return this.challengeStatusRepository.save(temp);
  }

  async markAsRejected(studentId: string, challengeId: string, date: Date): Promise<ChallengeStatus> {
    const temp = await this.challengeStatusRepository.findStatus(studentId, challengeId);
    temp.state = [State.REJECTED];
    temp.endedAt = date;
    return this.challengeStatusRepository.save(temp);
  }
}
