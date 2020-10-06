import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { Leaderboard } from './models/leaderboard.model';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { LeaderboardToPersistenceMapper } from './mappers/leaderboard-to-persistence.mapper';
import { PlayerRankingDto } from './dto/player-ranking.dto';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard> {
  constructor(
    protected readonly repository: LeaderboardRepository,
    protected readonly toDtoMapper: LeaderboardToDtoMapper,
    protected readonly toPersistenceMapper: LeaderboardToPersistenceMapper,
  ) {
    super(new Logger(LeaderboardService.name), repository);
  }

  async importGEdIL(game: Game, entries: { [path: string]: Buffer }, challenge?: Challenge): Promise<Leaderboard> {
    let leaderboard: Leaderboard;
    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      leaderboard = await this.create({
        ...encodedContent,
        game: game.id,
        parentChallenge: challenge?.id,
      });
    }
    return leaderboard;
  }

  // TODO instead of maintaining & updating scores in a collection,
  // calculate rankings on-demand

  async getRankings(leaderboardId: string): Promise<PlayerRankingDto[]> {
    return [];
  }

  /*async sortLeaderboard(leaderboardId: string): Promise<any> {
    const leaderboard: Leaderboard = await this.findById(leaderboardId);
    const list = await this.playerLeaderboardRepository.find({
      where: {
        leaderboardId: leaderboardId,
      },
    });
    list.sort((a, b) => {
      for (let i = 0; i < leaderboard.metrics.length; i++) {
        const metric = leaderboard.metrics[i];
        const sortingOrder = leaderboard.sortingOrders[i];
        const reverse = sortingOrder === SortingOrder.DESC ? -1 : 1;
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        }
      }
      return 0;
    });
    return list;
  }*/

  /*async sortPlayers(players: PlayerDto[], metrics: string[]): Promise<PlayerDto[]> {
    const submissionss = players.
    players.sort((a, b) => {
      for (let i = 0; i < leaderboard.metrics.length; i++) {
        const metric = leaderboard.metrics[i];
        const sortingOrder = leaderboard.sortingOrders[i];
        const reverse = sortingOrder === SortingOrder.DESC ? -1 : 1;
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        }
      }
      return 0;
    });
  }*/
}
