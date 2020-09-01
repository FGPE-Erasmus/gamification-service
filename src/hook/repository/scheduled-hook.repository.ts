import { ScheduledHookEntity } from '../entities/scheduled-hook.entity';
import { EntityRepository, Repository } from 'typeorm';

@EntityRepository(ScheduledHookEntity)
export class ScheduledHookRepository extends Repository<ScheduledHookEntity> {}
