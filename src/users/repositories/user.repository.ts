import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { User, UserDocument } from '../models/user.model';

@Injectable()
export class UserRepository extends BaseRepository<User, UserDocument> {
  constructor(@InjectModel('User') protected readonly userModel: Model<UserDocument>) {
    super(new Logger(UserRepository.name), userModel);
  }

  async upsertPlayer(id: string, player: { id: string }): Promise<User> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { registrations: player.id } });
  }

  async removePlayer(id: string, player: { id: string }): Promise<User> {
    return await this.findOneAndUpdate({ _id: id }, { $pull: { registrations: { _id: player.id } } });
  }
}
