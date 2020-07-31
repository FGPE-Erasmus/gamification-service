import { EntityRepository, Repository } from 'typeorm';

import { ChallengeStatusEntity as ChallengeStatus } from '../entities/challenge-status.entity';

@EntityRepository(ChallengeStatus)
export class ChallengeStatusRepository extends Repository<ChallengeStatus> {
  //helper
  async findStatus(studentId: string, challengeId: string): Promise<ChallengeStatus> {
    return super.findOne({
      where: {
        studentId,
        challengeId,
      },
    });
  }
}
