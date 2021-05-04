import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { BaseRepository } from '../../common/repositories/base.repository';
import { Group, GroupDocument } from '../models/group.model';

@Injectable()
export class GroupRepository extends BaseRepository<Group, GroupDocument> {
  constructor(@InjectModel('Group') protected readonly groupModel: Model<GroupDocument>) {
    super(new Logger(GroupRepository.name), groupModel);
  }

  async upsertPlayers(id: string, players: [{ id: string }]): Promise<Group> {
    return await this.findOneAndUpdate(
      { _id: id },
      { $addToSet: { players: { $each: players.map(player => player.id) } } },
    );
  }

  async upsertPlayer(id: string, player: { id: string }): Promise<Group> {
    return await this.findOneAndUpdate({ _id: id }, { $addToSet: { players: player.id } });
  }

  async removePlayer(id: string, player: { id: string }): Promise<Group> {
    return await this.findOneAndUpdate({ _id: id }, { $pullAll: { players: [player.id] } }, { multi: true });
  }
}
