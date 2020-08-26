import { Repository, EntityRepository } from 'typeorm';
import { HintEntity as Entity } from '../entities/hint.entity';

@EntityRepository(Entity)
export class HintRepository extends Repository<Entity> {}
