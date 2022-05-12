import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { GameDto } from '../dto/game.dto';
import { Game } from '../models/game.model';
import { pick } from '../../common/utils/object.utils';

@Injectable()
export class GameToDtoMapper implements IMapper<Game, GameDto> {
  async transform(obj: Game): Promise<GameDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'name',
        'archival',
        'private',
        'state',
        'evaluationEngine',
        'description',
        'courseId',
        'gedilLayerId',
        'gedilLayerDescription',
        'startDate',
        'endDate',
        'players',
        'validations',
        'submissions',
        'instructors',
        'createdAt',
        'updatedAt',
      ],
      obj,
    ) as GameDto;
  }
}
