import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { LeaderboardInput } from '../inputs/leaderboard.input';
import { Leaderboard } from '../models/leaderboard.model';

@Injectable()
export class LeaderboardToPersistenceMapper
  implements IMapper<LeaderboardInput | Partial<LeaderboardInput>, Leaderboard | Partial<Leaderboard>> {
  async transform(obj: LeaderboardInput | Partial<LeaderboardInput>): Promise<Leaderboard | Partial<Leaderboard>> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(Leaderboard, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
