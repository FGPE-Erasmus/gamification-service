import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ChallengeInput } from '../inputs/challenge.input';
import { Challenge } from '../models/challenge.model';

@Injectable()
export class ChallengeToPersistenceMapper
  implements IMapper<ChallengeInput | Partial<ChallengeInput>, Challenge | Partial<Challenge>> {
  async transform(obj: ChallengeInput | Partial<ChallengeInput>): Promise<Challenge | Partial<Challenge>> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(Challenge, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
