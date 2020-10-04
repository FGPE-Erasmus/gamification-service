import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerInput } from '../inputs/player.input';
import { Player } from '../models/player.model';

@Injectable()
export class PlayerToPersistenceMapper implements IMapper<PlayerInput | Partial<PlayerInput>, Player | Partial<Player>> {

  async transform(obj: PlayerInput | Partial<PlayerInput>): Promise<Player | Partial<Player>> {
    return plainToClass(Player, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
