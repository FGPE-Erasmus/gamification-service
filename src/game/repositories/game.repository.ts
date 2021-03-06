import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Game, GameDocument } from '../models/game.model';

@Injectable()
export class GameRepository extends BaseRepository<Game, GameDocument> {
  constructor(@InjectModel('Game') protected readonly gameModel: Model<GameDocument>) {
    super(new Logger(GameRepository.name), gameModel);
  }

  async upsertPlayer(id: string, player: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { players: player.id } });
  }

  async removePlayer(id: string, player: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { players: [player.id] } }, { multi: true });
  }

  async upsertSubmission(id: string, submission: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { submissions: submission.id } });
  }

  async removeSubmission(id: string, submission: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { submissions: [submission.id] } }, { multi: true });
  }

  async upsertValidation(id: string, validation: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { validations: validation.id } });
  }

  async removeValidation(id: string, validation: { id: string }): Promise<Game> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { validations: [validation.id] } }, { multi: true });
  }
}
