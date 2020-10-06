import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { Submission } from '../models/submission.model';
import { SubmissionInput } from '../inputs/submission.input';

@Injectable()
export class SubmissionToPersistenceMapper implements IMapper<SubmissionInput, Submission> {
  async transform(obj: SubmissionInput): Promise<Submission> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(Submission, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
