import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Challenge } from '../models/challenge.model';

@Injectable()
export class ChallengeRepository extends BaseRepository<Challenge> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(Challenge.name) protected readonly model: Model<Challenge>
  ) {
    super(logger, model);
  }

}
