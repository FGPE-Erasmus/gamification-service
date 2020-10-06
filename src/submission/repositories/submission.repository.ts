import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Submission } from '../models/submission.model';

@Injectable()
export class SubmissionRepository extends BaseRepository<Submission> {
  constructor(@InjectModel(Submission.name) protected readonly model: Model<Submission>) {
    super(new Logger(SubmissionRepository.name), model);
  }
}
