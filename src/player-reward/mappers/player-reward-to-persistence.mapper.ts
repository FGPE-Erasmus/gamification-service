import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerReward } from '../models/player-reward.model';
import { PlayerRewardInput } from '../inputs/player-reward.input';

@Injectable()
export class PlayerRewardToPersistenceMapper implements IMapper<PlayerRewardInput, PlayerReward> {
  async transform(obj: PlayerRewardInput): Promise<PlayerReward> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(PlayerReward, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
