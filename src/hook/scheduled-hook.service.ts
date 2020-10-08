import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHook } from './models/scheduled-hook.model';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook> {
  constructor(protected readonly repository: ScheduledHookRepository) {
    super(new Logger(ScheduledHookService.name), repository);
  }
}
