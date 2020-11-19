import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { PlayerReward } from './models/player-reward.model';
import { PlayerRewardRepository } from './repositories/player-reward.repository';
import { PlayerRewardToDtoMapper } from './mappers/player-reward-to-dto.mapper';

@Injectable()
export class PlayerRewardService extends BaseService<PlayerReward> {
  constructor(
    protected readonly repository: PlayerRewardRepository,
    protected readonly toDtoMapper: PlayerRewardToDtoMapper,
  ) {
    super(new Logger(PlayerRewardService.name), repository);
  }
}
