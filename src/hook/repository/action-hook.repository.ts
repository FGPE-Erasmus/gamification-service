import { EntityRepository, Repository } from 'typeorm';
import { ActionHookEntity } from '../entities/action-hook.entity';

@EntityRepository(ActionHookEntity)
export class ActionHookRepository extends Repository<ActionHookEntity> {}
