import { Processor, Process } from '@nestjs/bull';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';
import { Category } from 'src/hook/enums/category.enum';
import { Job } from 'bull';
import { Criteria } from 'src/hook/other-dto/criteria.dto';
import { Junctor } from 'src/hook/enums/junctor.enum';
import { Action } from 'src/hook/other-dto/action.dto';
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
import { Repository } from 'typeorm';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly actionHookRepository: ActionHookRepository,
    private readonly badgeRepository: BadgeRepository,
    private readonly couponRepository: CouponRepository,
    private readonly hintRepository: HintRepository,
    private readonly virtualItemRepository: VirtualItemRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  @Process()
  async performActionOnCompleted(job: Job<unknown>): Promise<any> {
    const hooks = await this.actionHookRepository.find({
      where: {
        gameId: job.data['gameId'],
        trigger: job.name,
      },
    });
    hooks.forEach(hook => {
      if (this.checkCriteria(hook.criteria)) {
        this.runActions(hook.actions, job.data['player'] as Player);
      }
    });
  }

  checkCriteria(criterias: Criteria[]): boolean {
    criterias.some(criteria => {
      const conditional = '';
      const junctorsLength = criteria.junctors.length;
      for (let i = 0; i < junctorsLength; i++) {
        const junctor = criteria.junctors[i] === Junctor.AND ? '&&' : '||';
        conditional.concat(criteria.conditions[i] + ' ' + junctor + ' ');
      }
      conditional.concat(criteria.conditions[junctorsLength]);
      if (!eval(conditional)) return false;
    });
    return true;
  }

  async runActions(actions: Action[], player: Player): Promise<any> {
    actions.forEach(action => {
      switch (action.type) {
        case Category.GIVE:
          this.grantReward(action.parameters, player);
          break;
        case Category.TAKE:
          //perform TAKE action
          break;
        case Category.UPDATE:
          //perform UPDATE action
          break;
      }
    });
  }

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

  async addNewReward<T>(reward: any, rewardType: string, player: Player, playerReward: any, repo: Repository<T>) {
    player[rewardType].push(playerReward);
    reward.players.push(playerReward);
    await this.playerRepository.save(player);
    await repo.save(reward);
  }
}
