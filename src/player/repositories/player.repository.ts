import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { GroupRepository } from '../../group/repositories/group.repository';
import { GameRepository } from '../../game/repositories/game.repository';
import { PlayerRewardRepository } from '../../player-reward/repositories/player-reward.repository';
import { ChallengeStatusRepository } from '../../challenge-status/repositories/challenge-status.repository';
import { Player, PlayerDocument } from '../models/player.model';
import { SubmissionRepository } from '../../submission/repositories/submission.repository';
import { ValidationRepository } from '../../submission/repositories/validation.repository';

@Injectable()
export class PlayerRepository extends BaseRepository<Player, PlayerDocument> {
  constructor(
    @InjectModel('Player') protected readonly model: Model<PlayerDocument>,
    protected readonly gameRepository: GameRepository,
    protected readonly groupRepository: GroupRepository,
    protected readonly playerRewardRepository: PlayerRewardRepository,
    @Inject(forwardRef(() => ChallengeStatusRepository))
    protected readonly challengeStatusRepository: ChallengeStatusRepository,
    protected readonly submissionRepository: SubmissionRepository,
    protected readonly validationRepository: ValidationRepository,
  ) {
    super(new Logger(PlayerRepository.name), model);
  }

  async save(doc: Partial<Player>, overwrite = true): Promise<any> {
    if (doc.id) {
      const old = await this.getById(doc.id);

      // if game changed, remove from previous game's collection
      if (doc.game != old.game) {
        await this.gameRepository.removePlayer(old.game, { id: doc.id });
      }

      // if group changed, remove from previous group's collection
      if (doc.group != old.group) {
        await this.groupRepository.removePlayer(old.group, { id: doc.id });
      }
    }

    // save the entity as requested
    const result = await super.save(doc, overwrite);

    // add to game's collection
    if (doc.game) {
      await this.gameRepository.upsertPlayer(doc.game, { id: result.id });
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

  async deleteOne(conditions: FilterQuery<PlayerDocument>, options: Record<string, unknown> = {}): Promise<Player> {
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
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { submissions: [submission.id] } }, { multi: true });
  }

  async upsertValidation(id: string, validation: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { validations: validation.id } });
  }

  async removeValidation(id: string, validation: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { validations: [validation.id] } }, { multi: true });
  }

  async upsertChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { learningPath: challengeStatus.id } });
  }

  async removeChallengeStatus(id: string, challengeStatus: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate(
      { _id: id },
      { $pullAll: { learningPath: [challengeStatus.id] } },
      { multi: true },
    );
  }

  async upsertPlayerReward(id: string, playerReward: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { rewards: playerReward.id } });
  }

  async removePlayerReward(id: string, playerReward: { id: string }): Promise<Player> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { rewards: [playerReward.id] } }, { multi: true });
  }

  private async removeRelationsOnDelete(player: Player): Promise<void> {
    // remove from game's collection
    if (player.game) {
      await this.gameRepository.removePlayer(player.game, { id: player.id });
    }
    // remove from group's collection
    if (player.group) {
      await this.groupRepository.removePlayer(player.group, { id: player.id });
    }
    // remove from player reward's collection
    await this.playerRewardRepository.deleteIf({ player: { $eq: player.id } });
    // remove from challenge status' collection
    await this.challengeStatusRepository.deleteIf({ player: { $eq: player.id } });
    // remove from submissions' collection
    await this.submissionRepository.deleteIf({ player: { $eq: player.id } });
    // remove from validations' collection
    await this.validationRepository.deleteIf({ player: { $eq: player.id } });
  }
}
