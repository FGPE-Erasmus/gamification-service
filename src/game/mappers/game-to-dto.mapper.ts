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
        'description',
        'gedilLayerId',
        'gedilLayerDescription',
        'startDate',
        'endDate',
        'players',
        'submissions',
        'createdAt',
        'updatedAt',
      ],
      obj,
    ) as GameDto;
  }

  /*async resolvePlayers(players: any[] = []): Promise<PlayerDto[]> {
    return Promise.all<PlayerDto>(players.map(async player => {
      if ( typeof player === 'string' || player instanceof Types.ObjectId ) {
        return this.playerService.findById(player);
      }
      return this.playerToDtoMapper.transform(player);
    }));
  }

  async resolveSubmissions(submissions: any[] = []): Promise<SubmissionDto[]> {
    return Promise.all<SubmissionDto>(submissions.map(async submission => {
      if ( typeof submission === 'string' || submission instanceof Types.ObjectId ) {
        return this.s.findById(player);
      }
      return this.playerToDtoMapper.transform(player);
    }));

  }*/
}
