import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { GroupRepository } from '../../group/repositories/group.repository';
import { UserRepository } from '../../users/repositories/user.repository';
import { Player, PlayerDocument } from '../models/player.model';

@Injectable()
export class PlayerRepository extends BaseRepository<Player, PlayerDocument> {
  constructor(
    @InjectModel('Player') protected readonly model: Model<PlayerDocument>,
    protected readonly userRepository: UserRepository,
    protected readonly groupRepository: GroupRepository,
  ) {
    super(new Logger(PlayerRepository.name), model);
  }

  async save(doc: Partial<Player>, overwrite = true): Promise<any> {
    if (doc.id) {
      const old = await this.getById(doc.id);

      // if user changed, remove from previous user's collection
      if (doc.user && old.user) {
        await this.userRepository.removePlayer(old.user, { id: doc.id });
      }

      // if group changed, remove from previous group's collection
      if (doc.group && old.group) {
        await this.groupRepository.removePlayer(old.group, { id: doc.id });
      }
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to user's collection
    if (doc.user) {
      await this.userRepository.upsertPlayer(doc.user, { id: result.id });
    }

    // add to group's collection
    if (doc.group) {
      await this.groupRepository.upsertPlayer(doc.group, { id: result.id });
    }

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

  async upsertSubmission(id: string, submission: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { submissions: submission.id } });
  }

  async removeSubmission(id: string, submission: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { submissions: { _id: submission.id } } });
  }

  async upsertChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { learningPath: challengeStatus.id } });
  }

  async removeChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { learningPath: { _id: challengeStatus.id } } });
  }

  async upsertPlayerReward(id: string, playerReward: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { rewards: playerReward.id } });
  }

  async removePlayerReward(id: string, playerReward: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { rewards: { _id: playerReward.id } } });
  }

  private async removeRelationsOnDelete(player: Player): Promise<void> {
    // remove from user's collection
    if (player.user) {
      await this.userRepository.removePlayer(player.user, { id: player.id });
    }
    // remove from group's collection
    if (player.group) {
      await this.groupRepository.removePlayer(player.group, { id: player.id });
    }
  }
}
