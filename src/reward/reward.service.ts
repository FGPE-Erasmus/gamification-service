import { Injectable, Logger } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { EventService } from '../event/event.service';
import { ActionHookService } from '../hook/action-hook.service';
import { PlayerService } from '../player/player.service';
import { RewardType } from './models/reward-type.enum';
import { Reward, RewardDocument } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { CategoryEnum } from '../hook/enums/category.enum';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { NotificationService } from '../notifications/notification.service';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Injectable()
export class RewardService extends BaseService<Reward, RewardDocument> {
  constructor(
    protected readonly repository: RewardRepository,
    protected readonly eventService: EventService,
    protected readonly playerService: PlayerService,
    protected readonly actionHookService: ActionHookService,
    protected readonly notificationService: NotificationService,
    protected readonly rewardToDtoMapper: RewardToDtoMapper,
    protected readonly playerRewardService: PlayerRewardService,
  ) {
    super(new Logger(RewardService.name), repository);
  }

  async create(input: Reward): Promise<Reward> {
    const result = await super.create(input);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  async update(id: string, input: Reward): Promise<Reward> {
    const result = await super.update(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  async patch(id: string, input: Partial<Reward>): Promise<Reward> {
    const result = await super.patch(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  async findOneAndUpdate(
    conditions: FilterQuery<RewardDocument>,
    updates: UpdateQuery<RewardDocument>,
    options?: Record<string, unknown>,
  ): Promise<Reward> {
    const result = await super.findOneAndUpdate(conditions, updates, options);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  async delete(id: string, soft = false): Promise<Reward> {
    const result = await super.delete(id, soft);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  async deleteOne(conditions: FilterQuery<RewardDocument>, options?: Record<string, unknown>): Promise<Reward> {
    const result = await super.deleteOne(conditions, options);
    this.notificationService.sendNotification(
      NotificationEnum.REWARD_MODIFIED,
      await this.rewardToDtoMapper.transform(result),
    );
    return result;
  }

  /**
   * Import GEdIL entries from a reward.
   *
   * @param {any} importTracker the objects already imported from the same archive.
   * @param {any[]} rules the rules to add
   * @param {Game} game the game which is being imported.
   * @param {[path: string]: Buffer} entries the archive entries to import.
   * @param {Challenge} challenge the challenge to which this reward is
   *                              appended (if any).
   * @returns {Promise<Reward | undefined>} the imported reward.
   */
  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string } },
    rules: any[],
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Reward | undefined> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);
    const gedilId = encodedContent.id;
    delete encodedContent.id;

    // create reward
    const reward = await this.create({
      ...encodedContent,
      game: game.id,
      parentChallenge: challenge?.id,
      challenges: encodedContent.challenges?.map(gedilId => importTracker.challenges[gedilId]),
    });

    importTracker.rewards[gedilId] = reward.id;

    // when appended to a challenge, assign on complete it
    if (challenge) {
      rules.push(
        async () =>
          await this.actionHookService.create({
            game: game.id,
            parentChallenge: challenge.id,
            sourceId: challenge.id,
            trigger: TriggerEvent.CHALLENGE_COMPLETED,
            criteria: {
              conditions: [],
              junctors: [],
            },
            actions: [
              {
                type: CategoryEnum.GIVE,
                parameters: [reward.id as string],
              },
            ],
            recurrent: false,
            active: true,
          }),
      );
    }

    return reward;
  }

  /**
   * Find all rewards within a specific game (optionally of a specific kind).
   *
   * @param gameId the ID of the game
   * @param kind the type of rewards
   * @returns {Promise<Reward[]>} the rewards.
   */
  async findByGameId(gameId: string, kind?: RewardType): Promise<Reward[]> {
    const query: { game: any; kind?: any } = { game: { $eq: gameId } };
    if (kind) {
      query.kind = { $eq: kind };
    }
    return await this.findAll(query);
  }

  async findByGameIdAndPlayerId(gameId: string, playerId: string, kind?: RewardType): Promise<Reward[]> {
    const playerRewards: PlayerReward[] = await this.playerRewardService.findAll({
      player: playerId,
    });
    const query: { game: any; players: any; kind?: any } = {
      game: { $eq: gameId },
      players: { $in: playerRewards },
    };
    if (kind) {
      query.kind = { $eq: kind };
    }
    return await this.findAll(query);
  }
}
