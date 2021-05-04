import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Reward, RewardDocument } from '../models/reward.model';

@Injectable()
export class RewardRepository extends BaseRepository<Reward, RewardDocument> {
  constructor(@InjectModel('Reward') protected readonly model: Model<RewardDocument>) {
    super(new Logger(RewardRepository.name), model);
  }

  async upsertPlayerReward(id: string, playerReward: { id: string }): Promise<Reward> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { players: playerReward.id } });
  }

  async removePlayerReward(id: string, playerReward: { id: string }): Promise<Reward> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { players: [playerReward.id] } }, { multi: true });
  }
}
