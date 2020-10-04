import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { RewardInput } from '../inputs/reward.input';
import { Reward } from '../models/reward.model';

@Injectable()
export class RewardToPersistenceMapper implements IMapper<RewardInput | Partial<RewardInput>, Reward | Partial<Reward>> {

  async transform(obj: RewardInput | Partial<RewardInput>): Promise<Reward | Partial<Reward>> {
    return plainToClass(Reward, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
