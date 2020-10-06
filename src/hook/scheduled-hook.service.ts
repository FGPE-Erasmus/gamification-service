import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHook } from './models/scheduled-hook.model';
import { ScheduledHookToPersistenceMapper } from './mappers/scheduled-hook-to-persistence.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook> {
  constructor(
    protected readonly repository: ScheduledHookRepository,
    protected readonly toDtoMapper: ScheduledHookToDtoMapper,
    protected readonly toPersistenceMapper: ScheduledHookToPersistenceMapper,
  ) {
    super(new Logger(ScheduledHookService.name), repository);
  }
}
