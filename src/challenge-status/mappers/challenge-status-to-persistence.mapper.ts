import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ChallengeStatusInput } from '../inputs/challenge-status.input';
import { ChallengeStatus } from '../models/challenge-status.model';

@Injectable()
export class ChallengeStatusToPersistenceMapper
  implements IMapper<ChallengeStatusInput | Partial<ChallengeStatusInput>, ChallengeStatus | Partial<ChallengeStatus>> {
  async transform(
    obj: ChallengeStatusInput | Partial<ChallengeStatusInput>,
  ): Promise<ChallengeStatus | Partial<ChallengeStatus>> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(ChallengeStatus, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
