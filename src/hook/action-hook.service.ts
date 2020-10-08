import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ActionHook } from './models/action-hook.model';

@Injectable()
export class ActionHookService extends BaseService<ActionHook> {
  constructor(protected readonly repository: ActionHookRepository) {
    super(new Logger(ActionHookService.name), repository);
  }
}
