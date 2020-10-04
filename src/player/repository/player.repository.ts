import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Player } from '../models/player.model';

@Injectable()
export class PlayerRepository extends BaseRepository<Player> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(Player.name) protected readonly model: Model<Player>
  ) {
    super(logger, model);
  }
}
