import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { SubmissionDto } from '../dto/submission.dto';
import { Submission } from '../models/submission.model';

@Injectable()
export class SubmissionToDtoMapper implements IMapper<Submission, SubmissionDto> {
  async transform(obj: Submission): Promise<SubmissionDto> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(SubmissionDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
