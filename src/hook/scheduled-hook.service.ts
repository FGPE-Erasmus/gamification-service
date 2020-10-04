import { Injectable, LoggerService } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookDto } from './dto/scheduled-hook.dto';
import { ScheduledHookInput } from './inputs/scheduled-hook.input';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';
import { ScheduledHook } from './models/scheduled-hook.model';
import { ScheduledHookToPersistenceMapper } from './mappers/scheduled-hook-to-persistence.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook, ScheduledHookInput, ScheduledHookDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: ScheduledHookRepository,
    protected readonly toDtoMapper: ScheduledHookToDtoMapper,
    protected readonly toPersistenceMapper: ScheduledHookToPersistenceMapper,
  ) {
    super(logger, repository, toDtoMapper, toPersistenceMapper);
  }

}
