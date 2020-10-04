import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import GameInput from '../inputs/game.input';
import { Game } from '../models/game.model';

@Injectable()
export class GameToPersistenceMapper implements IMapper<GameInput | Partial<GameInput>, Game | Partial<Game>> {

  async transform(obj: GameInput | Partial<GameInput>): Promise<Game | Partial<Game>> {
    return plainToClass(Game, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
