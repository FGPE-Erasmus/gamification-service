import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { RewardType } from 'src/common/enum/reward-type.enum';
import { BadgeRepository } from 'src/badge/repository/badge.repository';
import { CouponRepository } from 'src/coupon/repository/coupon.repository';
import { HintRepository } from 'src/hint/repository/hint.repository';
import { VirtualItemRepository } from 'src/virtual-item/repository/virtual-item.repository';
import { BadgeEntity as Badge } from 'src/badge/entities/badge.entity';
import { CouponEntity as Coupon } from 'src/coupon/entities/coupon.entity';
import { HintEntity as Hint } from 'src/hint/entities/hint.entity';
import { VirtualItemEntity as VirtualItem } from 'src/virtual-item/entities/virtual-item.entity';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { PlayerBadgeEntity } from 'src/badge/entities/badge-player.entity';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { PlayerCouponEntity } from 'src/coupon/entities/coupon-player.entity';
import { PlayerHintEntity } from 'src/hint/entities/hint-player.entity';
import { PlayerVirtualItemEntity } from 'src/virtual-item/entities/virtual-item-player.entity';
import { TriggerEvent } from 'src/hook/enums/trigger-event.enum';

@Injectable()
export class RewardService {
  constructor(
    @InjectQueue('hooksQueue') private hooksQueue: Queue,
    private badgeRepository: BadgeRepository,
    private couponRepository: CouponRepository,
    private hintRepository: HintRepository,
    private virtualItemRepository: VirtualItemRepository,
    private playerRepository: PlayerRepository,
  ) {}

  async grantReward(reward: any, player: Player): Promise<any> {
    let playerReward;
    switch (reward['type']) {
      case RewardType.BADGE || 'badge':
        if (this.checkIfExists(reward, 'badge', player, this.badgeRepository)) break;
        else {
          reward = reward as Badge;
          playerReward = {
            player: player,
            badge: reward,
            count: 1,
          } as PlayerBadgeEntity;
          await this.addNewReward(reward, 'badges', player, playerReward, this.badgeRepository);
          break;
        }

      case RewardType.COUPON || 'coupon':
        if (this.checkIfExists(reward, 'coupon', player, this.couponRepository)) break;
        else {
          reward = reward as Coupon;
          playerReward = {
            player: player,
            coupon: reward,
            count: 1,
          } as PlayerCouponEntity;
          await this.addNewReward(reward, 'coupons', player, playerReward, this.couponRepository);
          break;
        }

      case RewardType.HINT || 'hint':
        if (this.checkIfExists(reward, 'hint', player, this.hintRepository)) break;
        else {
          reward = reward as Hint;
          playerReward = {
            player: player,
            hint: reward,
            count: 1,
          } as PlayerHintEntity;
          await this.addNewReward(reward, 'hints', player, playerReward, this.hintRepository);
          break;
        }

      case RewardType.VIRTUAL_ITEM || 'virtual item':
        if (this.checkIfExists(reward, 'virtualItem', player, this.virtualItemRepository)) break;
        else {
          reward = reward as VirtualItem;
          playerReward = {
            player: player,
            virtualItem: reward,
            count: 1,
          } as PlayerVirtualItemEntity;
          await this.addNewReward(reward, 'virtualItems', player, playerReward, this.virtualItemRepository);
          break;
        }
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
        await this.playerRepository.save(player);
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
    await this.playerRepository.save(player);
    await repo.save(reward);
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }
}
