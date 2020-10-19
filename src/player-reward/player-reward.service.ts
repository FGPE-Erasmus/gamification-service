import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from '../player/models/player.model';
import { Reward } from '../reward/models/reward.model';
import { RewardType } from '../reward/models/reward-type.enum';
import { PlayerReward } from './models/player-reward.model';
import { PlayerRewardRepository } from './repositories/player-reward.repository';
import { PlayerRewardToDtoMapper } from './mappers/player-reward-to-dto.mapper';
import { PlayerRewardDto } from './dto/player-reward.dto';
import { PlayerDto } from 'src/player/dto/player.dto';

@Injectable()
export class PlayerRewardService extends BaseService<PlayerReward> {
  constructor(
    protected readonly repository: PlayerRewardRepository,
    protected readonly toDtoMapper: PlayerRewardToDtoMapper,
  ) {
    super(new Logger(PlayerRewardService.name), repository);
  }

  async giveReward(rewardId: string, player: PlayerDto, count: number) {
    this.repository.save({
      player: player.id,
      reward: rewardId,
      count: count,
    });
  }

  async ifEnoughForGranting(amount: string[]) {
    //after REWARD_GRANNTED trigger
    //to be implemented...
  }
}
