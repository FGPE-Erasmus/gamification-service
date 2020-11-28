import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Challenge, ChallengeDocument } from '../models/challenge.model';

@Injectable()
export class ChallengeRepository extends BaseRepository<Challenge, ChallengeDocument> {
  constructor(@InjectModel('Challenge') protected readonly model: Model<ChallengeDocument>) {
    super(new Logger(ChallengeRepository.name), model);
  }

  async upsertChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Challenge> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { learningPath: challengeStatus.id } });
  }

  async removeChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Challenge> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { learningPath: { _id: challengeStatus.id } } });
  }
}
