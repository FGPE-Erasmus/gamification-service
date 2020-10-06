import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameDto } from '../game/dto/game.dto';
import { ActionHookService } from '../hook/action-hook.service';
import { CategoryEnum } from '../hook/enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { RewardType } from './models/reward-type.enum';
import { Reward } from './models/reward.model';
import { RewardDto } from './dto/reward.dto';
import { RewardRepository } from './repositories/reward.repository';
import { RewardInput } from './inputs/reward.input';
import { RewardToDtoMapper } from './mappers/reward-to-dto.mapper';
import { RewardToPersistenceMapper } from './mappers/reward-to-persistence.mapper';

@Injectable()
export class RewardService extends BaseService<Reward, RewardInput, RewardDto> {
  constructor(
    protected readonly repository: RewardRepository,
    protected readonly toDtoMapper: RewardToDtoMapper,
    protected readonly toPersistenceMapper: RewardToPersistenceMapper,
    @InjectQueue('hooksQueue') protected readonly hooksQueue: Queue,
    protected readonly playerService: PlayerService,
    protected readonly actionHookService: ActionHookService,
  ) {
    super(new Logger(RewardService.name), repository, toDtoMapper, toPersistenceMapper);
  }

  /**
   * Import GEdIL entries from rewards.
   *
   * @param {Game} game the game to which import concerns.
   * @param {[path: string]: Buffer} entries the zipped entries to import.
   * @param {Challenge} challenge the challenge to which this reward is
   *                              appended (if any).
   * @returns {Promise<Reward | undefined>} the imported reward.
   */
  async importGEdIL(game: GameDto, entries: { [path: string]: Buffer }, challenge?: ChallengeDto): Promise<RewardDto> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);

    // create reward
    const reward: RewardDto = await this.create({
      ...encodedContent,
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
   * @returns {Promise<RewardDto[]>} the rewards.
   */
  async findByKind(kind?: RewardType): Promise<RewardDto[]> {
    return await this.findAll({ kind });
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
    /*player[rewardType].push(playerReward);
    reward.players.push(playerReward);
    await this.playerService.create(player.id?.toString(), player);
    await repo.save(reward);*/
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }

  toPersistence(input: RewardInput | Partial<RewardInput>): Reward | Promise<Reward> {
    throw new Error('Method not implemented.');
  }

  toDto(doc: Reward): RewardDto | Promise<RewardDto> {
    throw new Error('Method not implemented.');
  }
}
