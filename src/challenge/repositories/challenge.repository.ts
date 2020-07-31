import { EntityRepository, Repository } from 'typeorm';

import { ChallengeEntity } from '../entities/challenge.entity';

@EntityRepository(ChallengeEntity)
export class ChallengeRepository extends Repository<ChallengeEntity> {}
