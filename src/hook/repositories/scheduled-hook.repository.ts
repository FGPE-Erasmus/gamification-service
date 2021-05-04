import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { ScheduledHook, ScheduledHookDocument } from '../models/scheduled-hook.model';

@Injectable()
export class ScheduledHookRepository extends BaseRepository<ScheduledHook, ScheduledHookDocument> {
  constructor(@InjectModel('ScheduledHook') protected readonly model: Model<ScheduledHookDocument>) {
    super(new Logger(ScheduledHookRepository.name), model);
  }
}
