import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Game } from '../models/game.model';

@Injectable()
export class GameRepository extends BaseRepository<Game> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(Game.name) protected readonly gameModel: Model<Game>
  ) {
    super(logger, gameModel);
  }

}
