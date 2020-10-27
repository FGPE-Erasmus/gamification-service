import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { User } from '../models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(@InjectModel(User.name) protected readonly userModel: Model<User>) {
    super(new Logger(UserRepository.name), userModel);
  }

  async upsertPlayer(id: string, player: { _id: Types.ObjectId }): Promise<User> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { registrations: player._id } });
  }

  async removePlayer(id: string, player: { _id: Types.ObjectId }): Promise<User> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { registrations: player._id } });
  }
}
