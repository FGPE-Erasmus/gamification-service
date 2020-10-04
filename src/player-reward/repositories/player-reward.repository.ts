import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { PlayerReward } from '../models/player-reward.model';

@Injectable()
export class PlayerRewardRepository extends BaseRepository<PlayerReward> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(PlayerReward.name) protected readonly model: Model<PlayerReward>
  ) {
    super(logger, model);
  }
}
