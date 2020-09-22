import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { ServiceHelper } from '../common/helpers/service.helper';
import { RewardType } from './entities/reward-type.enum';
import { HookService } from '../hook/hook.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enum/trigger-event.enum';
import { PlayerEntity as Player } from '../player/entities/player.entity';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { RewardEntity as Reward } from './entities/reward.entity';
import { RewardDto } from './dto/reward.dto';
import { RewardRepository } from './repository/reward.repository';
import { PlayerService } from 'src/player/player.service';
import { ActionHookService } from 'src/hook/action-hook.service';
import { CategoryEnum } from 'src/hook/enum/category.enum';

@Injectable()
export class RewardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    @InjectQueue('hooksQueue') private hooksQueue: Queue,
    private playerService: PlayerService,
    private rewardRepository: RewardRepository,
    private actionHookService: ActionHookService,
  ) {}

  async importGEdIL(
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Reward | undefined> {
    let reward: Reward;
    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      reward = await this.createReward({
        ...encodedContent,
        game: game.id,
        parentChallenge: challenge?.id,
      });
      if (challenge) {
        this.actionHookService.create({
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
    }
    return reward;
  }

  async createReward<T extends RewardDto>(data: T): Promise<Reward> {
    const newReward: Reward = await this.serviceHelper.getUpsertData(null, { ...data }, this.rewardRepository);
    return await this.rewardRepository.save(newReward);
  }

  /**
   * Find all rewards.
   *
   * @returns {Promise<Reward[]>} the rewards.
   */
  async findAll(): Promise<Reward[]> {
    return await this.rewardRepository.find();
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
    const job = await this.hooksQueue.add(TriggerEvent.REWARD_GRANTED, {
      rewardId: reward.id,
      playerId: player.id,
    });
  }

  async checkIfExists<T, U>(reward: T, rewardType: string, player: Player, repo: Repository<T>): Promise<boolean> {
    let ifExists = false;
    const playerRewards = rewardType.concat('s');
    player[playerRewards].some(async entity => {
      if (entity[rewardType]['id'] === reward['id']) {
        entity['count'] += 1;
        reward[rewardType] = player[playerRewards];
        await this.playerService.createPlayer(player.id?.toString(), player);
        await repo.save(reward);
        return (ifExists = true);
      }
    });
    return ifExists;
  }

  async substractPoints(amount: string[], player: Player) {
    //substract points from the player, adding a field 'point' to Player entity?
    const job = await this.hooksQueue.add(TriggerEvent.POINTS_UPDATED, {
      playerId: player.id,
    });
  }

  async updatePlayer(params: string[], player: Player) {
    //updating user's properties (updated points? does this trigger concern update regarding all other rewards or smth more/else?)
    const job = await this.hooksQueue.add(TriggerEvent.PLAYER_UPDATED, {
      playerId: player.id,
    });
  }

  async addNewReward<T>(reward: any, rewardType: string, player: Player, playerReward: any, repo: Repository<T>) {
    player[rewardType].push(playerReward);
    reward.players.push(playerReward);
    await this.playerService.createPlayer(player.id?.toString(), player);
    await repo.save(reward);
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }
}
