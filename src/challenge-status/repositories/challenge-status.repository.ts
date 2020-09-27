import { EntityRepository, Repository } from 'typeorm';

import { ChallengeStatusEntity as ChallengeStatus } from '../entities/challenge-status.entity';

@EntityRepository(ChallengeStatus)
export class ChallengeStatusRepository extends Repository<ChallengeStatus> {}
