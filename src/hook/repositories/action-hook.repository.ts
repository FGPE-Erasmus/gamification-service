import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { ActionHook } from '../models/action-hook.model';

@Injectable()
export class ActionHookRepository extends BaseRepository<ActionHook> {
  constructor(@InjectModel(ActionHook.name) protected readonly model: Model<ActionHook>) {
    super(new Logger(ActionHookRepository.name), model);
  }
}
