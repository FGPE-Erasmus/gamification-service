import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { Player } from '../models/player.model';

@Injectable()
export class PlayerRepository extends BaseRepository<Player> {
  constructor(
    @InjectModel(Player.name) protected readonly model: Model<Player>,
    protected readonly userRepository: UserRepository,
  ) {
    super(new Logger(PlayerRepository.name), model);
  }

  async save(doc: Partial<Player>, overwrite = true): Promise<any> {
    // if user changed, remove from previous user's collection
    if (doc._id && doc.user) {
      await this.userRepository.removePlayer(doc.user, { _id: doc._id });
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to user's collection
    await this.userRepository.upsertPlayer(result.player, result);

    return result;
  }

  async delete(doc: Partial<Player>): Promise<Player> {
    const player: Player = await super.delete(doc);
    await this.removeRelationsOnDelete(player);
    return player;
  }

  async deleteOne(conditions: FilterQuery<Player>, options: Record<string, unknown> = {}): Promise<Player> {
    const player: Player = await super.deleteOne(conditions, options);
    await this.removeRelationsOnDelete(player);
    return player;
  }

  async deleteById(id: string): Promise<Player> {
    const player: Player = await super.deleteById(id);
    await this.removeRelationsOnDelete(player);
    return player;
  }

  async upsertSubmission(id: string, submission: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { submissions: submission._id } });
  }

  async removeSubmission(id: string, submission: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { submissions: submission._id } });
  }

  async upsertChallengeStatus(id: string, challengeStatus: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { learningPath: challengeStatus._id } });
  }

  async removeChallengeStatus(id: string, challengeStatus: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { learningPath: challengeStatus._id } });
  }

  async upsertPlayerReward(id: string, playerReward: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { rewards: playerReward._id } });
  }

  async removePlayerReward(id: string, playerReward: { _id: Types.ObjectId }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { rewards: playerReward._id } });
  }

  private async removeRelationsOnDelete(player: Player): Promise<void> {
    // remove from user's collection
    if (player.user) {
      await this.userRepository.removePlayer(player.user, { _id: player._id });
    }
  }
}
