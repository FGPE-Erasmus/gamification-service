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
import { PlayerService } from 'src/player/player.service';
import { SubmissionService } from 'src/submission/submission.service';
import { Player } from 'src/player/models/player.model';
import { SortingOrder } from './models/sorting.enum';
import { PlayerToDtoMapper } from 'src/player/mappers/player-to-dto.mapper';
import { JSONPath } from 'jsonpath-plus';
import { PlayerSubmissionsDto } from './dto/player-submissions.dto';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard> {
  constructor(
    protected readonly repository: LeaderboardRepository,
    protected readonly toDtoMapper: LeaderboardToDtoMapper,
    protected readonly toPersistenceMapper: LeaderboardToPersistenceMapper,
    protected readonly playerService: PlayerService,
    protected readonly submissionService: SubmissionService,
    protected readonly playertoDtoMapper: PlayerToDtoMapper,
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
    const leaderboard: Leaderboard = await this.findById(leaderboardId);
    const metrics: string[] = leaderboard.metrics;
    const rankingPlayers: PlayerRankingDto[] = [];
    const players: Player[] = await this.playerService.findAll({ game: leaderboard.game });

    players.forEach(async player => {
      const playersSubmissions: PlayerSubmissionsDto = {
        player: await player,
        submissions: await this.submissionService.findAll({
          $and: [{ player: { $eq: player.id } }, { game: { $eq: leaderboard.game } }],
        }),
      };

      const rankedPlayer: PlayerRankingDto = {
        player: player,
        score: new Map(),
      };

      metrics.forEach(metric => {
        rankedPlayer.score.set(metric, JSONPath({ path: metric, json: { ...playersSubmissions } })[2]);
      });
      rankingPlayers.push(rankedPlayer);
    });
    return this.sortPlayers(rankingPlayers, leaderboard);
  }

  sortPlayers(rankingPlayers: PlayerRankingDto[], leaderboard: Leaderboard): PlayerRankingDto[] {
    rankingPlayers = rankingPlayers.sort((a, b) => {
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
    });
    return rankingPlayers;
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
}
