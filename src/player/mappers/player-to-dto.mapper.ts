import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerDto } from '../dto/player.dto';
import { Player } from '../models/player.model';

@Injectable()
export class PlayerToDtoMapper implements IMapper<Player, PlayerDto> {
  async transform(obj: Player): Promise<PlayerDto> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(PlayerDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
