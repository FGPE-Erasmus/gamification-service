import { EntityRepository, Repository } from 'typeorm';

import { ChallengeStatusEntity as ChallengeStatus } from '../entities/challenge-status.entity';

@EntityRepository(ChallengeStatus)
export class ChallengeStatusRepository extends Repository<ChallengeStatus> {
  challengeStatusRepository: ChallengeStatusRepository;

  //helper
  async findStatus(studentId: string, challengeId: string): Promise<ChallengeStatus> {
    return this.challengeStatusRepository.findOne({
      where: {
        studentId,
        challengeId,
      },
    });
  }
}
