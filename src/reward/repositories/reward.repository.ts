import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Reward } from '../models/reward.model';

@Injectable()
export class RewardRepository extends BaseRepository<Reward> {
  constructor(@InjectModel(Reward.name) protected readonly model: Model<Reward>) {
    super(new Logger(RewardRepository.name), model);
  }

  async upsertPlayerReward(id: string, playerReward: { _id: Types.ObjectId }): Promise<Reward> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { rewards: playerReward._id } });
  }

  async removePlayerReward(id: string, playerReward: { _id: Types.ObjectId }): Promise<Reward> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { rewards: playerReward._id } });
  }
}
