import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { Leaderboard } from '../models/leaderboard.model';
import { LeaderboardDto } from '../dto/leaderboard.dto';


@Injectable()
export class LeaderboardToDtoMapper implements IMapper<Leaderboard, LeaderboardDto> {

  async transform(obj: Leaderboard): Promise<LeaderboardDto> {
    return plainToClass(LeaderboardDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }

  /*async resolvePlayers(players: any[] = []): Promise<PlayerDto[]> {
    return Promise.all<PlayerDto>(players.map(async player => {
      if ( typeof player === 'string' || player instanceof Types.ObjectId ) {
        return this.playerService.findById(player);
      }
      return this.playerToDtoMapper.transform(player);
    }));
  }*/

}
