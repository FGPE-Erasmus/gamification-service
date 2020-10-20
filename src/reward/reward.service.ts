import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { EventService } from '../event/event.service';
import { ActionHookService } from '../hook/action-hook.service';
import { CategoryEnum } from '../hook/enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { RewardType } from './models/reward-type.enum';
import { Reward } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';

@Injectable()
export class RewardService extends BaseService<Reward> {
  constructor(
    protected readonly repository: RewardRepository,
    protected readonly eventService: EventService,
    protected readonly playerService: PlayerService,
    protected readonly actionHookService: ActionHookService,
  ) {
    super(new Logger(RewardService.name), repository);
  }

  /**
   * Import GEdIL entries from a reward.
   *
   * @param {any} importTracker the objects already imported from the same archive.
   * @param {Game} game the game which is being imported.
   * @param {[path: string]: Buffer} entries the archive entries to import.
   * @param {Challenge} challenge the challenge to which this reward is
   *                              appended (if any).
   * @returns {Promise<Reward | undefined>} the imported reward.
   */
  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards' | 'rules']: { [k: string]: string } },
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Reward | undefined> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);

    // create reward
    const reward: Reward = await this.create({
      ...encodedContent,
      challenges: encodedContent.challenges?.map(gedilId => importTracker.challenges[gedilId]),
      game: game.id,
      parentChallenge: challenge?.id,
    });

    // if reward is appended to a challenge, set up a hook to give it when
    // challenge is complete
    if (challenge) {
      await this.actionHookService.create({
        game: game.id.toString(),
        parentChallenge: challenge?.id?.toString(),
        trigger: TriggerEvent.CHALLENGE_COMPLETED,
        sourceId: challenge?.id?.toString(),
        actions: [
          {
            type: CategoryEnum.GIVE,
            parameters: [reward.id.toString()],
          },
        ],
        recurrent: false,
        active: true,
      });
    }

    return reward;
  }

  /**
   * Find all rewards of a kind.
   *
   * @returns {Promise<Reward[]>} the rewards.
   */
  async findByKind(kind?: RewardType): Promise<Reward[]> {
    return await this.findAll({ kind: { $eq: kind } });
  }

  async grantReward(reward: any, player: Player): Promise<any> {
    let playerReward;
    switch (reward['type']) {
      case RewardType.BADGE || 'badge':
        /* if (!this.checkIfExists(reward, 'badge', player, this.badgeRepository)) {
          reward = reward as Badge;
          playerReward = {
            player: player,
            badge: reward,
            count: 1,
          } as PlayerBadgeEntity;
          await this.addNewReward(reward, 'badges', player, playerReward, this.badgeRepository);
        } */
        break;

      case RewardType.COUPON || 'coupon':
        /* if (!this.checkIfExists(reward, 'coupon', player, this.couponRepository)) {
          reward = reward as Coupon;
          playerReward = {
            player: player,
            coupon: reward,
            count: 1,
          } as PlayerCouponEntity;
          await this.addNewReward(reward, 'coupons', player, playerReward, this.couponRepository);
        } */
        break;

      case RewardType.HINT || 'hint':
        /* if (!this.checkIfExists(reward, 'hint', player, this.hintRepository)) {
          reward = reward as Hint;
          playerReward = {
            player: player,
            hint: reward,
            count: 1,
          } as PlayerHintEntity;
          await this.addNewReward(reward, 'hints', player, playerReward, this.hintRepository);
        } */
        break;

      case RewardType.VIRTUAL_ITEM || 'virtual item':
        /* if (!this.checkIfExists(reward, 'virtualItem', player, this.virtualItemRepository)) {
          reward = reward as VirtualItem;
          playerReward = {
            player: player,
            virtualItem: reward,
            count: 1,
          } as PlayerVirtualItemEntity;
          await this.addNewReward(reward, 'virtualItems', player, playerReward, this.virtualItemRepository);
        } */
        break;
    }
    const job = await this.eventService.fireEvent(TriggerEvent.REWARD_GRANTED, {
      rewardId: reward.id,
      playerId: player.id,
    });
  }

  async checkIfExists<T, U>(reward: T, rewardType: string, player: Player): Promise<boolean> {
    const ifExists = false;
    /*const playerRewards = rewardType.concat('s');
    player[playerRewards].some(async entity => {
      if ( entity[rewardType]['id'] === reward['id'] ) {
        entity['count'] += 1;
        reward[rewardType] = player[playerRewards];
        await this.playerService.create(player.id?.toString(), player);
        await repo.save(reward);
        return (ifExists = true);
      }
    });*/
    return ifExists;
  }

  async substractPoints(amount: string[], player: Player) {
    //substract points from the player, adding a field 'point' to Player entity?
    const job = await this.eventService.fireEvent(TriggerEvent.POINTS_UPDATED, {
      playerId: player.id,
    });
  }

  async updatePlayer(params: string[], player: Player) {
    //updating user's properties (updated points? does this trigger concern update regarding all other rewards or smth more/else?)
    const job = await this.eventService.fireEvent(TriggerEvent.PLAYER_UPDATED, {
      playerId: player.id,
    });
  }

  async addNewReward<T>(reward: any, rewardType: string, player: Player, playerReward: any) {
    /*player[rewardType].push(playerReward);
    reward.players.push(playerReward);
    await this.playerService.create(player.id?.toString(), player);
    await repo.save(reward);*/
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }
}
