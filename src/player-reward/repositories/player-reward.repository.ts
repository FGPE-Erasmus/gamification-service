import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { PlayerRepository } from '../../player/repositories/player.repository';
import { RewardRepository } from '../../reward/repositories/reward.repository';
import { PlayerReward } from '../models/player-reward.model';

@Injectable()
export class PlayerRewardRepository extends BaseRepository<PlayerReward> {
  constructor(
    @InjectModel(PlayerReward.name) protected readonly model: Model<PlayerReward>,
    protected readonly rewardRepository: RewardRepository,
    protected readonly playerRepository: PlayerRepository,
  ) {
    super(new Logger(PlayerRewardRepository.name), model);
  }

  async save(doc: Partial<PlayerReward>, overwrite = true): Promise<any> {
    // if reward changed, remove from previous reward's collection
    if (doc._id && doc.reward) {
      await this.rewardRepository.removePlayerReward(doc.reward, { _id: doc._id });
    }
    // if player changed, remove from previous player's collection
    if (doc._id && doc.player) {
      await this.playerRepository.removePlayerReward(doc.player, { _id: doc._id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to reward's collection
    await this.rewardRepository.upsertPlayerReward(result.reward, result);

    // add to player's collection
    await this.playerRepository.upsertPlayerReward(result.player, result);

    return result;
  }

  async delete(doc: Partial<PlayerReward>): Promise<PlayerReward> {
    const playerReward: PlayerReward = await super.delete(doc);
    await this.removeRelationsOnDelete(playerReward);
    return playerReward;
  }

  async deleteOne(conditions: FilterQuery<PlayerReward>, options: Record<string, unknown> = {}): Promise<PlayerReward> {
    const playerReward: PlayerReward = await super.deleteOne(conditions, options);
    await this.removeRelationsOnDelete(playerReward);
    return playerReward;
  }

  async deleteById(id: string): Promise<PlayerReward> {
    const playerReward: PlayerReward = await super.deleteById(id);
    await this.removeRelationsOnDelete(playerReward);
    return playerReward;
  }

  private async removeRelationsOnDelete(playerReward: PlayerReward): Promise<void> {
    // remove from reward's collection
    if (playerReward.reward) {
      await this.rewardRepository.removePlayerReward(playerReward.reward, { _id: playerReward._id });
    }
    // remove from player's collection
    if (playerReward.player) {
      await this.playerRepository.removePlayerReward(playerReward.player, { _id: playerReward._id });
    }
  }
}
