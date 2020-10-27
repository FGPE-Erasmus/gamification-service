import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Game } from '../models/game.model';

@Injectable()
export class GameRepository extends BaseRepository<Game> {
  constructor(@InjectModel(Game.name) protected readonly gameModel: Model<Game>) {
    super(new Logger(GameRepository.name), gameModel);
  }

  async upsertPlayer(id: string, player: { _id: Types.ObjectId }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { players: player._id } });
  }

  async removePlayer(id: string, submission: { _id: Types.ObjectId }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { submissions: submission._id } });
  }

  async upsertSubmission(id: string, submission: { _id: Types.ObjectId }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { submissions: submission._id } });
  }

  async removeSubmission(id: string, submission: { _id: Types.ObjectId }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { submissions: submission._id } });
  }
}
