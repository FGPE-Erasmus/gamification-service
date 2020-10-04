import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { RewardDto } from '../dto/reward.dto';
import { Reward } from '../models/reward.model';

@Injectable()
export class RewardToDtoMapper implements IMapper<Reward, RewardDto> {

  async transform(obj: Reward): Promise<RewardDto> {
    return plainToClass(RewardDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
