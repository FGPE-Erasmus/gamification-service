import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { Leaderboard } from '../models/leaderboard.model';
import { LeaderboardDto } from '../dto/leaderboard.dto';

@Injectable()
export class LeaderboardToDtoMapper implements IMapper<Leaderboard, LeaderboardDto> {
  async transform(obj: Leaderboard): Promise<LeaderboardDto> {
    if (!obj) {
      return undefined;
    }
    return pick(['id', 'game', 'parentChallenge', 'name', 'metrics', 'sortingOrders', 'createdAt', 'updatedAt'], obj);
  }
}
