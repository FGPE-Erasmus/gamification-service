import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ChallengeStatusDto } from '../dto/challenge-status.dto';
import { ChallengeStatus } from '../models/challenge-status.model';

@Injectable()
export class ChallengeStatusToDtoMapper implements IMapper<ChallengeStatus, ChallengeStatusDto> {
  async transform(obj: ChallengeStatus): Promise<ChallengeStatusDto> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(ChallengeStatusDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
