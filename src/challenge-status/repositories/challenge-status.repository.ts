import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";

import { BaseRepository } from '../../common/repositories/base.repository';
import { ChallengeStatus } from '../models/challenge-status.model';

@Injectable()
export class ChallengeStatusRepository extends BaseRepository<ChallengeStatus> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(ChallengeStatus.name) protected readonly model: Model<ChallengeStatus>
  ) {
    super(logger, model);
  }

}
