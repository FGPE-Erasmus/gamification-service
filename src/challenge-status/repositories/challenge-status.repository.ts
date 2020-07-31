import { EntityRepository, Repository } from 'typeorm';

import { ChallengeStatusEntity } from '../entities/challenge-status.entity';

@EntityRepository(ChallengeStatusEntity)
export class ChallengeStatusRepository extends Repository<ChallengeStatusEntity> {}
