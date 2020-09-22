import { EntityRepository, Repository } from 'typeorm';

import { RewardEntity as Reward } from '../entities/reward.entity';

@EntityRepository(Reward)
export class RewardRepository extends Repository<Reward> {}
