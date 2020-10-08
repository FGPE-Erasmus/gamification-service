import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ChallengeStatusDto } from '../dto/challenge-status.dto';
import { ChallengeStatus } from '../models/challenge-status.model';
import { pick } from '../../common/utils/object.utils';

@Injectable()
export class ChallengeStatusToDtoMapper implements IMapper<ChallengeStatus, ChallengeStatusDto> {
  async transform(obj: ChallengeStatus): Promise<ChallengeStatusDto> {
    if (!obj) {
      return undefined;
    }
    return pick(['id', 'player', 'challenge', 'openedAt', 'startedAt', 'endedAt', 'state'], obj);
  }
}
