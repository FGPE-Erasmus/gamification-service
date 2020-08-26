import { Repository, EntityRepository } from 'typeorm';

import { BadgeEntity as Badge } from '../entities/badge.entity';

@EntityRepository(Badge)
export class BadgeRepository extends Repository<Badge> {}
