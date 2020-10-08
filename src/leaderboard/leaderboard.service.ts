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

  /**
   * Import GEdIL entries from a leaderboard.
   *
   * @param {any} importTracker the objects already imported from the same archive.
   * @param {Game} game the game which is being imported.
   * @param {[path: string]: Buffer} entries the archive entries to import.
   * @param {Challenge} challenge the challenge to which this leaderboard is
   *                              appended (if any).
   * @returns {Promise<Leaderboard | undefined>} the imported leaderboard.
   */
  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards' | 'rules']: { [k: string]: string } },
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Leaderboard | undefined> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);

    // create leaderboard
    const leaderboard: Leaderboard = await this.create({
      ...encodedContent,
      sortingOrders: encodedContent.sorting_orders,
      game: game.id,
      parentChallenge: challenge?.id,
    });

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
