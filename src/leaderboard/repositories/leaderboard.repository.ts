import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Leaderboard, LeaderboardDocument } from '../models/leaderboard.model';

@Injectable()
export class LeaderboardRepository extends BaseRepository<Leaderboard, LeaderboardDocument> {
  constructor(@InjectModel('Leaderboard') protected readonly model: Model<LeaderboardDocument>) {
    super(new Logger(LeaderboardRepository.name), model);
  }
}
