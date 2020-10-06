import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ActionHook } from './models/action-hook.model';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ActionHookToPersistenceMapper } from './mappers/action-hook-to-persistence.mapper';

@Injectable()
export class ActionHookService extends BaseService<ActionHook> {
  constructor(
    protected readonly repository: ActionHookRepository,
    protected readonly toDtoMapper: ActionHookToDtoMapper,
    protected readonly toPersistenceMapper: ActionHookToPersistenceMapper,
  ) {
    super(new Logger(ActionHookService.name), repository);
  }
}
