import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { GameRepository } from '../../game/repositories/game.repository';
import { PlayerRepository } from '../../player/repositories/player.repository';
import { Submission } from '../models/submission.model';

@Injectable()
export class SubmissionRepository extends BaseRepository<Submission> {
  constructor(
    @InjectModel(Submission.name) protected readonly model: Model<Submission>,
    protected readonly gameRepository: GameRepository,
    protected readonly playerRepository: PlayerRepository,
  ) {
    super(new Logger(SubmissionRepository.name), model);
  }

  async save(doc: Partial<Submission>, overwrite = true): Promise<any> {
    // if game changed, remove from previous game's collection
    if (doc._id && doc.game) {
      await this.gameRepository.removeSubmission(doc.game, { _id: doc._id });
    }
    // if player changed, remove from previous player's collection
    if (doc._id && doc.player) {
      await this.playerRepository.removeSubmission(doc.player, { _id: doc._id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to game's collection
    await this.gameRepository.upsertSubmission(result.game, result);

    // add to player's collection
    await this.playerRepository.upsertSubmission(result.player, result);

    return result;
  }

  async delete(doc: Partial<Submission>): Promise<Submission> {
    const submission: Submission = await super.delete(doc);
    await this.removeRelationsOnDelete(submission);
    return submission;
  }

  async deleteOne(conditions: FilterQuery<Submission>, options: Record<string, unknown> = {}): Promise<Submission> {
    const submission: Submission = await super.deleteOne(conditions, options);
    await this.removeRelationsOnDelete(submission);
    return submission;
  }

  async deleteById(id: string): Promise<Submission> {
    const submission: Submission = await super.deleteById(id);
    await this.removeRelationsOnDelete(submission);
    return submission;
  }

  private async removeRelationsOnDelete(submission: Submission): Promise<void> {
    // remove from game's collection
    if (submission.game) {
      await this.gameRepository.removeSubmission(submission.game, { _id: submission._id });
    }
    // remove from player's collection
    if (submission.player) {
      await this.playerRepository.removeSubmission(submission.player, { _id: submission._id });
    }
  }
}
