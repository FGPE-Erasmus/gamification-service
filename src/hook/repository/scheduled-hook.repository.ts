import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { ScheduledHook } from '../models/scheduled-hook.model';

@Injectable()
export class ScheduledHookRepository extends BaseRepository<ScheduledHook> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(ScheduledHook.name) protected readonly model: Model<ScheduledHook>
  ) {
    super(logger, model);
  }
}
