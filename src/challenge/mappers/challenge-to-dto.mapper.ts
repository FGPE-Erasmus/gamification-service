import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ChallengeDto } from '../dto/challenge.dto';
import { Challenge } from '../models/challenge.model';

@Injectable()
export class ChallengeToDtoMapper implements IMapper<Challenge, ChallengeDto> {
  async transform(obj: Challenge): Promise<ChallengeDto> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(ChallengeDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
