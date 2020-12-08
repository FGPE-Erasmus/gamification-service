import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { SubmissionDto } from '../dto/submission.dto';
import { Submission } from '../models/submission.model';

@Injectable()
export class SubmissionToDtoMapper implements IMapper<Submission, SubmissionDto> {
  async transform(obj: Submission): Promise<SubmissionDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'player',
        'exerciseId',
        'evaluationEngine',
        'evaluationEngineId',
        'language',
        'result',
        'grade',
        'feedback',
        'metrics',
        'submittedAt',
        'evaluatedAt',
        'createdAt',
        'updatedAt',
      ],
      obj,
    );
  }
}
