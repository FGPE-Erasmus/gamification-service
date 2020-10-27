import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Challenge } from '../models/challenge.model';

@Injectable()
export class ChallengeRepository extends BaseRepository<Challenge> {
  constructor(@InjectModel(Challenge.name) protected readonly model: Model<Challenge>) {
    super(new Logger(ChallengeRepository.name), model);
  }

  async upsertChallengeStatus(id: string, challengeStatus: { _id: Types.ObjectId }): Promise<Challenge> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { learningPath: challengeStatus._id } });
  }

  async removeChallengeStatus(id: string, challengeStatus: { _id: Types.ObjectId }): Promise<Challenge> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { learningPath: challengeStatus._id } });
  }
}
