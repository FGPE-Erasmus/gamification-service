import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Reward } from '../models/reward.model';

@Injectable()
export class RewardRepository extends BaseRepository<Reward> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(Reward.name) protected readonly model: Model<Reward>
  ) {
    super(logger, model);
  }
}
