import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { GameDto } from '../dto/game.dto';
import { Game } from '../models/game.model';
import { pick } from '../../common/utils/object.utils';

@Injectable()
export class GameToDtoMapper implements IMapper<Game, GameDto> {
  /*constructor(
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly submissionToDtoMapper: Submi,
    protected readonly submissionService: PlayerService,
  ) {
  }*/

  async transform(obj: Game): Promise<GameDto> {
    /*return {
      ...obj,
      players: resolve.includes('players')
        ? await this.resolvePlayers(obj.players)
        : obj.players,
      submissions: resolve.includes('submissions')
        ? await this.resolvePlayers(obj.submissions)
        : obj.submissions
    } as GameDto;*/
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
