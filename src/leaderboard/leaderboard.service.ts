import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { JSONPath } from 'jsonpath-plus';
import { FilterQuery, MongooseFilterQuery, UpdateQuery } from 'mongoose';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { PlayerRankingDto } from './dto/player-ranking.dto';
import { PlayerService } from '../player/player.service';
import { SubmissionService } from '../submission/submission.service';
import { Player, PlayerDocument } from '../player/models/player.model';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { groupBy } from '../common/utils/array.utils';
import { bestSubmission } from '../common/helpers/submission.helper';
import { ChallengeService } from '../challenge/challenge.service';
import { Submission } from '../submission/models/submission.model';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { Leaderboard, LeaderboardDocument } from './models/leaderboard.model';
import { SortingOrder } from './models/sorting.enum';
import { LeaderboardRepository } from './repositories/leaderboard.repository';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard, LeaderboardDocument> {
  constructor(
    protected readonly repository: LeaderboardRepository,
    protected readonly toDtoMapper: LeaderboardToDtoMapper,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    @Inject(forwardRef(() => PlayerService)) protected readonly playerService: PlayerService,
    protected readonly notificationService: NotificationService,
    protected readonly submissionService: SubmissionService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly leaderboardToDtoMapper: LeaderboardToDtoMapper,
  ) {
    super(new Logger(LeaderboardService.name), repository);
  }

  async create(input: Leaderboard): Promise<Leaderboard> {
    const result = await super.create(input);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  async update(id: string, input: Leaderboard): Promise<Leaderboard> {
    const result = await super.update(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  async patch(id: string, input: Partial<Leaderboard>): Promise<Leaderboard> {
    const result = await super.patch(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  async findOneAndUpdate(
    conditions: FilterQuery<LeaderboardDocument>,
    updates: UpdateQuery<LeaderboardDocument>,
    options?: Record<string, unknown>,
  ): Promise<Leaderboard> {
    const result = await super.findOneAndUpdate(conditions, updates, options);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  async delete(id: string, soft = false): Promise<Leaderboard> {
    const result = await super.delete(id, soft);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  async deleteOne(
    conditions: FilterQuery<LeaderboardDocument>,
    options?: Record<string, unknown>,
  ): Promise<Leaderboard> {
    const result = await super.deleteOne(conditions, options);
    this.notificationService.sendNotification(
      NotificationEnum.LEADERBOARD_MODIFIED,
      await this.leaderboardToDtoMapper.transform(result),
    );
    return result;
  }

  /**
   * Import GEdIL entries from a leaderboard.
   *
   * @param {any} importTracker the objects already imported from the same archive.
   * @param {any[]} rules the rules to add
   * @param {Game} game the game which is being imported.
   * @param {[path: string]: Buffer} entries the archive entries to import.
   * @param {Challenge} challenge the challenge to which this leaderboard is
   *                              appended (if any).
   * @returns {Promise<Leaderboard | undefined>} the imported leaderboard.
   */
  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string | string[] } },
    rules: any[],
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Leaderboard | undefined> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);
    const gedilId = encodedContent.id;
    delete encodedContent.id;

    // create leaderboard
    const leaderboard = await this.create({
      ...encodedContent,
      sortingOrders: encodedContent.sorting_orders,
      game: game.id,
      parentChallenge: challenge?.id,
    });

    importTracker.leaderboards[gedilId] = leaderboard.id;

    return leaderboard;
  }

  /**
   * Find all leaderboards within a specific game.
   *
   * @param gameId the ID of the game
   * @returns {Promise<Leaderboard[]>} the leaderboards.
   */
  async findByGameId(gameId: string): Promise<Leaderboard[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }

  async getRankings(leaderboardId: string, groupId?: string): Promise<PlayerRankingDto[]> {
    const leaderboard: Leaderboard = await this.findById(leaderboardId);

    const exerciseIds: string[] = await this.challengeService.getExercises(
      leaderboard.game,
      leaderboard.parentChallenge,
    );

    const queryPlayer: MongooseFilterQuery<PlayerDocument> = { game: { $eq: leaderboard.game } };
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
        player: player.id,
        score: {},
      };

      // player's submissions
      const submissions: Submission[] = await this.submissionService.findAll(
        {
          $and: [
            { game: { $eq: leaderboard.game } },
            { player: { $eq: player.id } },
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
}
