import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Group } from '../models/group.model';

@Injectable()
export class GroupRepository extends BaseRepository<Group> {
  constructor(@InjectModel(Group.name) protected readonly groupModel: Model<Group>) {
    super(new Logger(GroupRepository.name), groupModel);
  }

  async upsertPlayers(id: string, players: [{ _id: Types.ObjectId }]): Promise<Group> {
    return await this.findOneAndUpdate(
      { _id: id },
      { $addToSet: { players: { $each: players.map(player => player._id) } } },
    );
  }

  async upsertPlayer(id: string, player: { _id: Types.ObjectId }): Promise<Group> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { players: player._id } });
  }

  async removePlayer(id: string, player: { _id: Types.ObjectId }): Promise<Group> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { players: [player._id] } }, { multi: true });
  }
}
