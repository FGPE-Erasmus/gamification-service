import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerDto } from '../../player/dto/player.dto';
import { PlayerToDtoMapper } from '../../player/mappers/player-to-dto.mapper';
import { PlayerService } from '../../player/player.service';
import { SubmissionDto } from '../../submission/dto/submission.dto';
import { GameDto } from '../dto/game.dto';
import { Game } from '../models/game.model';
import { classToPlain, plainToClass } from 'class-transformer';

@Injectable()
export class GameToDtoMapper implements IMapper<Game, GameDto> {

  /*constructor(
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly playerService: PlayerService,
    protected readonly submissionToDtoMapper: Submi,
    protected readonly submissionService: PlayerService,
  ) {
  }*/

  async transform(obj: Game, resolve: (keyof Game)[] = ['players', 'submissions']): Promise<GameDto> {
    /*return {
      ...obj,
      players: resolve.includes('players')
        ? await this.resolvePlayers(obj.players)
        : obj.players,
      submissions: resolve.includes('submissions')
        ? await this.resolvePlayers(obj.submissions)
        : obj.submissions
    } as GameDto;*/
    return plainToClass(GameDto, classToPlain(obj, { excludeExtraneousValues: true }));
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
