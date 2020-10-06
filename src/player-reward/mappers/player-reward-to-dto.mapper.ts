import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerReward } from '../models/player-reward.model';
import { PlayerRewardDto } from '../dto/player-reward.dto';

@Injectable()
export class PlayerRewardToDtoMapper implements IMapper<PlayerReward, PlayerRewardDto> {
  async transform(obj: PlayerReward): Promise<PlayerRewardDto> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(PlayerRewardDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
