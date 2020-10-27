import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { ChallengeStatus } from '../models/challenge-status.model';
import { PlayerRepository } from '../../player/repositories/player.repository';
import { ChallengeRepository } from '../../challenge/repositories/challenge.repository';

@Injectable()
export class ChallengeStatusRepository extends BaseRepository<ChallengeStatus> {
  constructor(
    @InjectModel(ChallengeStatus.name) protected readonly model: Model<ChallengeStatus>,
    protected readonly challengeRepository: ChallengeRepository,
    protected readonly playerRepository: PlayerRepository,
  ) {
    super(new Logger(ChallengeStatusRepository.name), model);
  }

  async save(doc: Partial<ChallengeStatus>, overwrite = true): Promise<any> {
    // if challenge changed, remove from previous challenge's collection
    if (doc._id && doc.challenge) {
      await this.challengeRepository.removeChallengeStatus(doc.challenge, { _id: doc._id });
    }
    // if player changed, remove from previous player's collection
    if (doc._id && doc.player) {
      await this.playerRepository.removeChallengeStatus(doc.player, { _id: doc._id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to challenge's collection
    await this.challengeRepository.upsertChallengeStatus(result.challenge, result);

    // add to player's collection
    await this.playerRepository.upsertChallengeStatus(result.player, result);

    return result;
  }

  async delete(doc: Partial<ChallengeStatus>): Promise<ChallengeStatus> {
    const challengeStatus: ChallengeStatus = await super.delete(doc);
    await this.removeRelationsOnDelete(challengeStatus);
    return challengeStatus;
  }

  async deleteOne(
    conditions: FilterQuery<ChallengeStatus>,
    options: Record<string, unknown> = {},
  ): Promise<ChallengeStatus> {
    const challengeStatus: ChallengeStatus = await super.deleteOne(conditions, options);
    await this.removeRelationsOnDelete(challengeStatus);
    return challengeStatus;
  }

  async deleteById(id: string): Promise<ChallengeStatus> {
    const challengeStatus: ChallengeStatus = await super.deleteById(id);
    await this.removeRelationsOnDelete(challengeStatus);
    return challengeStatus;
  }

  private async removeRelationsOnDelete(challengeStatus: ChallengeStatus): Promise<void> {
    // remove from challenge's collection
    if (challengeStatus.challenge) {
      await this.challengeRepository.removeChallengeStatus(challengeStatus.challenge, { _id: challengeStatus._id });
    }
    // remove from player's collection
    if (challengeStatus.player) {
      await this.playerRepository.removeChallengeStatus(challengeStatus.player, { _id: challengeStatus._id });
    }
  }
}
