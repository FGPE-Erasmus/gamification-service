import { EntityRepository, Repository } from 'typeorm';
import { HookEntity } from '../entities/hook.entity';

@EntityRepository(HookEntity)
export class HookRepository extends Repository<HookEntity> {}
