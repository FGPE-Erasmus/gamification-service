import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { Validation } from '../models/validation.model';
import { ValidationDto } from '../dto/validation.dto';

@Injectable()
export class ValidationToDtoMapper implements IMapper<Validation, ValidationDto> {
  async transform(obj: Validation): Promise<ValidationDto> {
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
        'feedback',
        'metrics',
        'outputs',
        'userExecutionTimes',
        'result',
        'submittedAt',
        'evaluatedAt',
        'createdAt',
        'updatedAt',
      ],
      obj,
    );
  }
}
