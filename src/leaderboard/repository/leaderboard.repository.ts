import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Leaderboard } from '../models/leaderboard.model';

@Injectable()
export class LeaderboardRepository extends BaseRepository<Leaderboard> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(Leaderboard.name) protected readonly model: Model<Leaderboard>
  ) {
    super(logger, model);
  }

}
