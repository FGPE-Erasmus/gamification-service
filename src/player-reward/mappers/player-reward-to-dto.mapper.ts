import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { PlayerRewardDto } from '../dto/player-reward.dto';
import { PlayerReward } from '../models/player-reward.model';

@Injectable()
export class PlayerRewardToDtoMapper implements IMapper<PlayerReward, PlayerRewardDto> {
  async transform(obj: PlayerReward): Promise<PlayerRewardDto> {
    if (!obj) {
      return undefined;
    }
    return pick(['id', 'player', 'reward', 'count'], obj);
  }
}
