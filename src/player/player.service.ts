import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player, PlayerDocument } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { EventService } from '../event/event.service';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';
import { GameService } from '../game/game.service';
import { PlayerStatsDto } from './dto/player-stats.dto';
import { Submission } from '../submission/models/submission.model';
import { SubmissionService } from '../submission/submission.service';
import { groupBy } from '../common/utils/array.utils';
import { Result } from '../submission/models/result.enum';
import { Validation } from '../submission/models/validation.model';
import { StatsDto } from './dto/stats.dto';
import { CacheService } from '../cache/cache.service';

@Injectable()
export class PlayerService extends BaseService<Player, PlayerDocument> {
  constructor(
    protected readonly repository: PlayerRepository,
    protected readonly eventService: EventService,
    protected readonly gameService: GameService,
    protected readonly submissionService: SubmissionService,
    @Inject(forwardRef(() => GroupService)) protected readonly groupService: GroupService,
    protected readonly cacheService: CacheService,
  ) {
    super(new Logger(PlayerService.name), repository);
  }

  async findByGame(gameId: string): Promise<Player[]> {
    return this.findAll({ game: { $eq: gameId } });
  }

  async findByGameAndUser(gameId: string, userId: string): Promise<Player> {
    return await this.findOne({
      $and: [{ user: { $eq: userId } }, { game: { $eq: gameId } }],
    });
  }

  async findByUser(userId: string): Promise<Player[]> {
    return await this.findAll({
      user: { $eq: userId },
    });
  }

  async enroll(gameId: string, userId: string, enrolledByTeacher?: boolean): Promise<Player> {
    // is the player already enrolled?
    let player: Player = await this.findByGameAndUser(gameId, userId);
    if (player) return player;

    // is the game private? If so - has the enrollment been issued by a teacher?
    const game = await this.gameService.findById(gameId);
    if (game.private && (!enrolledByTeacher || typeof enrolledByTeacher == undefined))
      throw new Error('The private game cannot be accessed.');

    // enroll
    player = await this.create({ game: gameId, user: userId });

    // send PLAYER_ENROLLED event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_ENROLLED, {
      gameId: gameId,
      playerId: player.id,
    });

    return player;
  }

  async removeFromGame(gameId: string, userId: string): Promise<Player> {
    // is the player enrolled?
    let player: Player = await this.findByGameAndUser(gameId, userId);
    if (!player) {
      throw new NotFoundException();
    }

    // remove player
    player = await this.delete(player.id);

    // send PLAYER_LEFT event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_LEFT, {
      gameId: gameId,
      playerId: player.id,
    });

    return player;
  }

  async removeFromGroup(playerId: string): Promise<Player> {
    return await this.patch(playerId, { group: null });
  }

  async setGroup(gameId: string, playerId: string, groupId: string): Promise<Player> {
    // is the player enrolled?
    const player: Player = await this.findOne({
      _id: { $eq: playerId },
      game: { $eq: gameId },
    });
    if (!player) {
      throw new NotFoundException();
    }

    // does the group exist?
    const group: Group = await this.groupService.findOne({
      _id: { $eq: groupId },
      game: { $eq: gameId },
    });
    if (!group) {
      throw new NotFoundException();
    }

    return await this.patch(playerId, { group: groupId });
  }

  async bulkRemoveFromGroup(gameId: string, playersIds: string[]): Promise<Player[]> {
    return await Promise.all(
      playersIds.map(async playerId => {
        return await this.removeFromGroup(playerId);
      }),
    );
  }

  async bulkSetGroup(gameId: string, playersIds: string[], groupId: string): Promise<Player[]> {
    return await Promise.all(
      playersIds.map(async playerId => {
        return await this.setGroup(gameId, playerId, groupId);
      }),
    );
  }

  async statistics(gameId: string, groupId?: string): Promise<StatsDto> {
    const players: Player[] = await this.findByGame(gameId);
    const playersStatistics: PlayerStatsDto[] = await Promise.all(
      players
        .filter(player => !groupId || player.group === groupId)
        .map(async player => await this.playerStatistics(gameId, player.user)),
    );
    let statistics: StatsDto = {
      game: gameId,
      nrOfSubmissions: 0,
      nrOfValidations: 0,
      nrOfSubmissionsByActivity: {},
      nrOfValidationsByActivity: {},
      nrOfSubmissionsByActivityAndResult: {},
      nrOfValidationsByActivityAndResult: {},
    };
    for (const playerStatistics of playersStatistics) {
      statistics = await this.mergePlayerStatistics(statistics, playerStatistics);
    }
    return statistics;
  }

  async playerStatistics(gameId: string, userId: string): Promise<PlayerStatsDto> {
    // check cache
    const cacheKey = `player-stats:g${gameId}-u${userId}`;
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      console.log(`Using cached ${cacheKey}`);
      return cached;
    }

    // is the user enrolled?
    const player: Player = await this.findOne(
      {
        user: { $eq: userId },
        game: { $eq: gameId },
      },
      null,
      { populate: 'submissions validations learningPath rewards' },
    );
    if (!player) {
      throw new NotFoundException();
    }

    // build stats
    const submissionsByActivity: Record<string, Submission[]> = groupBy(
      player.submissions,
      (submission: Submission) => submission.exerciseId,
    );
    const submissionsByActivityAndResult: Record<string, Record<Result, Submission[]>> = {};
    Object.keys(submissionsByActivity).forEach(activity => {
      submissionsByActivityAndResult[activity] = groupBy(
        submissionsByActivity[activity],
        (submission: Submission) => submission.result,
      );
    });

    const validationsByActivity: Record<string, Validation[]> = groupBy(
      player.validations,
      (submission: Submission) => submission.exerciseId,
    );
    const validationsByActivityAndResult: Record<string, Record<Result, Validation[]>> = {};
    Object.keys(validationsByActivity).forEach(activity => {
      validationsByActivityAndResult[activity] = groupBy(
        validationsByActivity[activity],
        (submission: Submission) => submission.result,
      );
    });

    const result = {
      player: player.id,
      nrOfSubmissions: player.submissions.length,
      nrOfValidations: player.validations.length,
      nrOfSubmissionsByActivity: Object.entries(submissionsByActivity).reduce(
        (p, [k, v]) => ({ ...p, [k]: v.length }),
        {},
      ),
      nrOfValidationsByActivity: Object.entries(validationsByActivity).reduce(
        (p, [k, v]) => ({ ...p, [k]: v.length }),
        {},
      ),
      nrOfSubmissionsByActivityAndResult: Object.entries(submissionsByActivityAndResult).reduce((p, [k, v]) => {
        return {
          ...p,
          [k]: Object.entries(v).reduce((p2, [k2, v2]) => ({ ...p2, [k2]: v2.length }), {}),
        };
      }, {}),
      nrOfValidationsByActivityAndResult: Object.entries(validationsByActivityAndResult).reduce((p, [k, v]) => {
        return {
          ...p,
          [k]: Object.entries(v).reduce((p2, [k2, v2]) => ({ ...p2, [k2]: v2.length }), {}),
        };
      }, {}),
    };

    await this.cacheService.set(cacheKey, result);

    return result;
  }

  async mergePlayerStatistics(stats: StatsDto, playerStats: PlayerStatsDto): Promise<StatsDto> {
    const nrOfSubmissionsByActivity = {};
    new Set([
      ...Object.keys(stats.nrOfSubmissionsByActivity || {}),
      ...Object.keys(playerStats.nrOfSubmissionsByActivity || {}),
    ]).forEach(activity => {
      nrOfSubmissionsByActivity[activity] =
        (stats.nrOfSubmissionsByActivity[activity] || 0) + (playerStats.nrOfSubmissionsByActivity[activity] || 0);
    });

    const nrOfValidationsByActivity = {};
    new Set([
      ...Object.keys(stats.nrOfValidationsByActivity || {}),
      ...Object.keys(playerStats.nrOfValidationsByActivity || {}),
    ]).forEach(activity => {
      nrOfValidationsByActivity[activity] =
        (stats.nrOfValidationsByActivity[activity] || 0) + (playerStats.nrOfValidationsByActivity[activity] || 0);
    });

    const nrOfSubmissionsByActivityAndResult = {};
    new Set([
      ...Object.keys(stats.nrOfSubmissionsByActivityAndResult || {}),
      ...Object.keys(playerStats.nrOfSubmissionsByActivityAndResult || {}),
    ]).forEach(activity => {
      new Set([
        ...Object.keys(stats.nrOfSubmissionsByActivityAndResult[activity] || {}),
        ...Object.keys(playerStats.nrOfSubmissionsByActivityAndResult[activity] || {}),
      ]).forEach(result => {
        nrOfSubmissionsByActivityAndResult[activity] = {};
        nrOfSubmissionsByActivityAndResult[activity][result] =
          (stats.nrOfSubmissionsByActivityAndResult[activity]?.[result] || 0) +
          (playerStats.nrOfSubmissionsByActivityAndResult[activity]?.[result] || 0);
      });
    });

    const nrOfValidationsByActivityAndResult = {};
    new Set([
      ...Object.keys(stats.nrOfValidationsByActivityAndResult || {}),
      ...Object.keys(playerStats.nrOfValidationsByActivityAndResult || {}),
    ]).forEach(activity => {
      new Set([
        ...Object.keys(stats.nrOfValidationsByActivityAndResult[activity] || {}),
        ...Object.keys(playerStats.nrOfValidationsByActivityAndResult[activity] || {}),
      ]).forEach(result => {
        nrOfValidationsByActivityAndResult[activity] = {};
        nrOfValidationsByActivityAndResult[activity][result] =
          (stats.nrOfValidationsByActivityAndResult[activity]?.[result] || 0) +
          (playerStats.nrOfValidationsByActivityAndResult[activity]?.[result] || 0);
      });
    });

    return {
      nrOfSubmissions: stats.nrOfSubmissions + playerStats.nrOfSubmissions,
      nrOfValidations: stats.nrOfValidations + playerStats.nrOfValidations,
      nrOfSubmissionsByActivity,
      nrOfValidationsByActivity,
      nrOfSubmissionsByActivityAndResult,
      nrOfValidationsByActivityAndResult,
    };
  }

  async invalidateCaches(playerId: string): Promise<void> {
    const player: Player = await this.findById(playerId);
    await this.cacheService.invalidate(`player-stats:g${player.game}-u${player.user}`);
  }
}
