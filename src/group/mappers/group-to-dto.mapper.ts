import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { GroupDto } from '../dto/group.dto';
import { Group } from '../models/group.model';

@Injectable()
export class GroupToDtoMapper implements IMapper<Group, GroupDto> {
  async transform(obj: Group): Promise<GroupDto> {
    if (!obj) {
      return undefined;
    }
    return {
      id: obj.id,
      game: obj.game,
      name: obj.name,
      displayName: obj.displayName,
      imageUrl: obj.imageUrl,
      players: obj.players,
      createdAt: obj['createdAt'],
      updatedAt: obj['updatedAt'],
    };
  }
}
