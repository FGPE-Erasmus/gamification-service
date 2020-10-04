import { Injectable, LoggerService } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { User } from '../models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {

  constructor(
    protected readonly logger: LoggerService,
    @InjectModel(User.name) protected readonly userModel: Model<User>
  ) {
    super(logger, userModel);
  }
}
