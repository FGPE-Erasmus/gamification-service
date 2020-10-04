import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { PlayerLeaderboard } from '../models/player-leaderboard.model';

@Injectable()
export class PlayerLeaderboardRepository extends BaseRepository<PlayerLeaderboard> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(PlayerLeaderboard.name) protected readonly model: Model<PlayerLeaderboard>
  ) {
    super(logger, model);
  }

}
