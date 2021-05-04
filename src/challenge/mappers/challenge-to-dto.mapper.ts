import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { ChallengeDto } from '../dto/challenge.dto';
import { Challenge } from '../models/challenge.model';

@Injectable()
export class ChallengeToDtoMapper implements IMapper<Challenge, ChallengeDto> {
  async transform(obj: Challenge): Promise<ChallengeDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'parentChallenge',
        'name',
        'description',
        'difficulty',
        'mode',
        'modeParameters',
        'refs',
        'locked',
        'hidden',
        'createdAt',
        'updatedAt',
      ],
      obj,
    ) as ChallengeDto;
  }
}
