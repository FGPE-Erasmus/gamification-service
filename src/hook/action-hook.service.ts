import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { ActionHookDto } from './dto/action-hook.dto';
import { ActionHookInput } from './inputs/action-hook.input';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { BaseService } from '../common/services/base.service';
import { ActionHook } from './models/action-hook.model';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ActionHookToPersistenceMapper } from './mappers/action-hook-to-persistence.mapper';

@Injectable()
export class ActionHookService extends BaseService<ActionHook, ActionHookInput, ActionHookDto> {
  constructor(
    protected readonly repository: ActionHookRepository,
    protected readonly toDtoMapper: ActionHookToDtoMapper,
    protected readonly toPersistenceMapper: ActionHookToPersistenceMapper,
  ) {
    super(new Logger(ActionHookService.name), repository, toDtoMapper, toPersistenceMapper);
  }
}
