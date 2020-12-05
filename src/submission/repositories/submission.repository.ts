import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { GameRepository } from '../../game/repositories/game.repository';
import { PlayerRepository } from '../../player/repositories/player.repository';
import { Submission, SubmissionDocument } from '../models/submission.model';

@Injectable()
export class SubmissionRepository extends BaseRepository<Submission, SubmissionDocument> {
  constructor(
    @InjectModel('Submission') protected readonly model: Model<SubmissionDocument>,
    protected readonly gameRepository: GameRepository,
    @Inject(forwardRef(() => PlayerRepository)) protected readonly playerRepository: PlayerRepository,
  ) {
    super(new Logger(SubmissionRepository.name), model);
  }

  async save(doc: Partial<Submission>, overwrite = true): Promise<any> {
    // if game changed, remove from previous game's collection
    if (doc.id && doc.game) {
      await this.gameRepository.removeSubmission(doc.game, { id: doc.id });
    }
    // if player changed, remove from previous player's collection
    if (doc.id && doc.player) {
      await this.playerRepository.removeSubmission(doc.player, { id: doc.id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to game's collection
    await this.gameRepository.upsertSubmission(result.game, { id: result.id });

    // add to player's collection
    await this.playerRepository.upsertSubmission(result.player, { id: result.id });

    return result;
  }

  async deleteIf(conditions: FilterQuery<Submission>, options: Record<string, unknown> = {}): Promise<Submission[]> {
    const submissions: Submission[] = await super.deleteIf(conditions, options);
    for (const submission of submissions) {
      await this.removeRelationsOnDelete(submission);
    }
    return submissions;
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
      await this.gameRepository.removeSubmission(submission.game, { id: submission.id });
    }
    // remove from player's collection
    if (submission.player) {
      await this.playerRepository.removeSubmission(submission.player, { id: submission.id });
    }
  }
}
