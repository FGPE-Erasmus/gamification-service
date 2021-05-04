import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { RewardDto } from '../dto/reward.dto';
import { Reward } from '../models/reward.model';
import { pick } from '../../common/utils/object.utils';

@Injectable()
export class RewardToDtoMapper implements IMapper<Reward, RewardDto> {
  async transform(obj: Reward): Promise<RewardDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'parentChallenge',
        'kind',
        'name',
        'description',
        'image',
        'recurrent',
        'cost',
        'amount',
        'message',
        'challenges',
        'players',
        'createdAt',
        'updatedAt',
      ],
      obj,
    );
  }
}
