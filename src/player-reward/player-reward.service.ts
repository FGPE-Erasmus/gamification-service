import { Injectable, LoggerService } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { PlayerDto } from '../player/dto/player.dto';
import { RewardDto } from '../reward/dto/reward.dto';
import { Player } from '../player/models/player.model';
import { PlayerRepository } from '../player/repository/player.repository';
import { Reward } from '../reward/models/reward.model';
import { RewardType } from '../reward/models/reward-type.enum';
import { RewardRepository } from '../reward/repository/reward.repository';
import { PlayerReward } from './models/player-reward.model';
import { PlayerRewardDto } from './dto/player-reward.dto';
import { PlayerRewardInput } from './inputs/player-reward.input';
import { PlayerRewardRepository } from './repositories/player-reward.repository';

@Injectable()
export class PlayerRewardService extends BaseService<PlayerReward, PlayerRewardInput, PlayerRewardInput, PlayerRewardDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: PlayerRewardRepository,
    protected readonly playerRepository: PlayerRepository,
    protected readonly rewardRepository: RewardRepository,
  ) {
    super(logger, repository);
  }

  async create(input: PlayerRewardInput): Promise<PlayerRewardDto> {

  }

  async grantReward(reward: Reward, player: Player): Promise<any> {
    let playerReward;
    switch (reward['type']) {
      case RewardType.BADGE:
      case RewardType.COUPON:
      case RewardType.HINT:
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

  async checkIfExists<T, U>(reward: T, rewardType: string, player: Player): Promise<boolean> {
    let ifExists = false;
    const playerRewards = rewardType.concat('s');
    player[playerRewards].some(async entity => {
      if (entity[rewardType]['id'] === reward['id']) {
        entity['count'] += 1;
        reward[rewardType] = player[playerRewards];
        await this.playerService.create(player.id?.toString(), player);
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

  async addNewReward<T>(reward: any, rewardType: string, player: Player, playerReward: any) {
    player[rewardType].push(playerReward);
    reward.players.push(playerReward);
    await this.playerService.create(player.id?.toString(), player);
    await repo.save(reward);
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }

  async toPersistence(input: PlayerRewardInput): Promise<PlayerReward> {
    const player: Player = await this.playerRepository.getById(input.playerId);
    const reward: Reward = await this.rewardRepository.getById(input.rewardId);
    return {
      player,
      reward
    } as PlayerReward;
  }

  toDto(doc: PlayerReward): Promise<PlayerRewardDto> {

  }
}
