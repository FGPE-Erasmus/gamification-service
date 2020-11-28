import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { ActionHook, ActionHookDocument } from '../models/action-hook.model';

@Injectable()
export class ActionHookRepository extends BaseRepository<ActionHook, ActionHookDocument> {
  constructor(@InjectModel('ActionHook') protected readonly model: Model<ActionHookDocument>) {
    super(new Logger(ActionHookRepository.name), model);
  }
}
