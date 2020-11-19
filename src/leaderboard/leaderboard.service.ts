import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { JSONPath } from 'jsonpath-plus';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { PlayerRankingDto } from './dto/player-ranking.dto';
import { PlayerService } from '../player/player.service';
import { SubmissionService } from '../submission/submission.service';
import { Player } from '../player/models/player.model';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { groupBy } from '../common/utils/array.utils';
import { bestSubmission } from '../common/helpers/submission.helper';
import { ChallengeService } from '../challenge/challenge.service';
import { Submission } from '../submission/models/submission.model';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { Leaderboard } from './models/leaderboard.model';
import { SortingOrder } from './models/sorting.enum';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { toString } from '../common/utils/mongo.utils';
import { MongooseFilterQuery } from 'mongoose';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard> {
  constructor(
    protected readonly repository: LeaderboardRepository,
    protected readonly toDtoMapper: LeaderboardToDtoMapper,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly submissionService: SubmissionService,
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
    return await this.create({
      ...encodedContent,
      sortingOrders: encodedContent.sorting_orders,
      game: game.id,
      parentChallenge: challenge?.id,
    });
  }

  async getRankings(leaderboardId: string, groupId?: string): Promise<PlayerRankingDto[]> {
    const leaderboard: Leaderboard = await this.findById(leaderboardId);

    const exerciseIds: string[] = await this.challengeService.getExercises(
      leaderboard.game,
      leaderboard.parentChallenge,
    );

    const queryPlayer: MongooseFilterQuery<Player> = { game: { $eq: leaderboard.game } };
    if (leaderboard.groups && groupId) {
      queryPlayer.group = { $eq: groupId };
    }

    const players: Player[] = await this.playerService.findAll(queryPlayer, undefined, {
      lean: true,
      populate: 'learningPath rewards',
    });

    const metrics = {};
    const rankingPlayers: PlayerRankingDto[] = [];
    for (const player of players) {
      const rankedPlayer: PlayerRankingDto = {
        player: player._id,
        score: {},
      };

      // player's submissions
      const submissions: Submission[] = await this.submissionService.findAll(
        {
          $and: [
            { game: { $eq: leaderboard.game } },
            { player: { $eq: toString(player._id) } },
            { exerciseId: { $in: exerciseIds } },
          ],
        },
        undefined,
        { lean: true },
      );
      const groupedSubmissions: { [k: string]: Submission[] } = groupBy(submissions, s => s.exerciseId);
      const latestSubmissions: { [k: string]: any } = {};
      Object.keys(groupedSubmissions).forEach(exerciseId => {
        latestSubmissions[exerciseId] = bestSubmission(groupedSubmissions[exerciseId]);
      });

      // calculate scores
      leaderboard.metrics.forEach((metric, i) => {
        const match = JSONPath({
          path: metric,
          json: {
            player,
            latestSubmissions,
            submissions: groupedSubmissions,
          },
          wrap: false,
          resultType: 'all',
        });
        if (!match) {
          return;
        }
        if (Array.isArray(match)) {
          for (const submatch of match) {
            console.log(submatch);
            if (rankedPlayer.score.hasOwnProperty(submatch.parentProperty)) {
              if (!rankedPlayer.score[submatch.parentProperty].hasOwnProperty(submatch.pointer)) {
                rankedPlayer.score[submatch.parentProperty][submatch.pointer] = submatch.value;
              }
            } else {
              rankedPlayer.score[submatch.parentProperty] = {
                [submatch.pointer]: submatch.value,
              };
            }
            metrics[submatch.parentProperty] = leaderboard.sortingOrders[i];
          }
        } else {
          rankedPlayer.score[match.parentProperty] = match.value;
          metrics[match.parentProperty] = leaderboard.sortingOrders[i];
        }
      });

      rankingPlayers.push(rankedPlayer);
    }

    return LeaderboardService.sortPlayers(rankingPlayers, metrics);
  }

  private static sortPlayers(
    rankingPlayers: PlayerRankingDto[],
    metrics: { [key: string]: SortingOrder },
  ): PlayerRankingDto[] {
    rankingPlayers = rankingPlayers.sort((a, b) => {
      for (const metric in metrics) {
        const sortingOrder = metrics[metric];
        if (
          (typeof a.score[metric] === 'object' && a.score[metric] !== null) ||
          (typeof b.score[metric] === 'object' && b.score[metric] !== null)
        ) {
          return LeaderboardService.compareComposites(
            a.score[metric],
            b.score[metric],
            sortingOrder === SortingOrder.DESC,
          );
        }
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

  private static compareComposites(a: any, b: any, desc: boolean): number {
    let aw = 0;
    let bw = 0;
    if (!a) {
      return desc ? -1 : 1;
    } else if (!b) {
      return desc ? 1 : -1;
    }
    const props = [...new Set([...Object.keys(a), ...Object.keys(b)])];
    for (const prop of props) {
      if ((a[prop] === undefined || a[prop] == null) && (b[prop] === undefined || b[prop] == null)) {
        continue;
      } else if (a[prop] === undefined || a[prop] == null) {
        desc ? bw++ : aw++;
      } else if (b[prop] === undefined || b[prop] == null) {
        desc ? aw++ : bw++;
      }
      if (desc) {
        if (a[prop] < b[prop]) {
          aw++;
        } else if (a[prop] > b[prop]) {
          bw++;
        }
      } else {
        if (a[prop] < b[prop]) {
          bw++;
        } else if (a[prop] > b[prop]) {
          aw++;
        }
      }
    }
    return aw === bw ? 0 : aw > bw ? 1 : -1;
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
