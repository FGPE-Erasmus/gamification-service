import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { PlayerDto } from '../dto/player.dto';
import { Player } from '../models/player.model';

@Injectable()
export class PlayerToDtoMapper implements IMapper<Player, PlayerDto> {
  async transform(obj: Player): Promise<PlayerDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'user',
        'group',
        'points',
        'submissions',
        'validations',
        'learningPath',
        'rewards',
        'createdAt',
        'updatedAt',
      ],
      obj,
    );
  }
}
