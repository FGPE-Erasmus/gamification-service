import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Parse } from 'unzipper';
import { FilterQuery, UpdateQuery } from 'mongoose';

import { IFile } from '../common/interfaces/file.interface';
import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { ChallengeService } from '../challenge/challenge.service';
import { HookService } from '../hook/hook.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';
import { GameInput } from './inputs/game.input';
import { Game, GameDocument } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import { UserDto } from '../keycloak/dto/user.dto';
import { ScheduledHookService } from '../hook/scheduled-hook.service';
import { UserService } from '../keycloak/user.service';
import { NotificationService } from '../notifications/notification.service';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { CategoryEnum } from 'src/hook/enums/category.enum';
import { GameStateEnum } from './enum/game-state.enum';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';
import { TokenDto } from '../common/dto/token.dto';
import { createToken, verifyToken } from '../common/services/jwt.service';
import { appConfig } from '../app.config';

@Injectable()
export class GameService extends BaseService<Game, GameDocument> {
  constructor(
    protected readonly repository: GameRepository,
    protected readonly userService: UserService,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly notificationService: NotificationService,
    protected readonly gameToDtoMapper: GameToDtoMapper,
    @Inject(forwardRef(() => RewardService)) protected readonly rewardService: RewardService,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    @Inject(forwardRef(() => ScheduledHookService)) protected readonly scheduledHookService: ScheduledHookService,
    @Inject(forwardRef(() => HookService)) protected readonly hookService: HookService,
  ) {
    super(new Logger(GameService.name), repository);
  }

  async create(input: Game): Promise<Game> {
    const result = await super.create(input);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  async update(id: string, input: Game): Promise<Game> {
    const result = await super.update(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  async patch(id: string, input: Partial<Game>): Promise<Game> {
    const result = await super.patch(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  async findOneAndUpdate(
    conditions: FilterQuery<GameDocument>,
    updates: UpdateQuery<GameDocument>,
    options?: Record<string, unknown>,
  ): Promise<Game> {
    const result = await super.findOneAndUpdate(conditions, updates, options);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  async delete(id: string, soft = false): Promise<Game> {
    const result = await super.delete(id, soft);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  async deleteOne(conditions: FilterQuery<GameDocument>, options?: Record<string, unknown>): Promise<Game> {
    const result = await super.deleteOne(conditions, options);
    this.notificationService.sendNotification(
      NotificationEnum.GAME_MODIFIED,
      await this.gameToDtoMapper.transform(result),
    );
    return result;
  }

  /**
   * Import a game from a GEdIL layer archive.
   *
   * @param {GameInput} input the game attributes
   * @param {IFile} gedilFile the GEdIL specification package.
   * @param {String} teacherId ID of the teacher
   */
  async importGEdILArchive(input: GameInput, gedilFile: IFile, teacherId: string): Promise<Game | undefined> {
    let game: Game;

    const entries = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    const zip = gedilFile.content.pipe(Parse({ forceStream: true }));
    for await (const entry of zip) {
      const fileName = entry.path;
      const buffer = await entry.buffer();

      if (fileName === 'metadata.json') {
        const gedilLayer = extractToJson(buffer);
        game = await this.create({
          ...input,
          state: GameStateEnum.LOCKED,
          gedilLayerId: gedilLayer.id,
          gedilLayerDescription: `[${gedilLayer.name}] ${gedilLayer.description}`,
          instructors: [teacherId],
        });
      } else {
        if (!fileName.includes('metadata.json')) continue;
        const result = /^(challenges|leaderboards|rewards|rules)\/([^/]+)\//.exec(fileName);
        if (result) {
          const subpath = fileName.substring(result[0].length);
          if (!entries[result[1]][result[2]]) {
            entries[result[1]][result[2]] = {};
          }
          entries[result[1]][result[2]][subpath] = buffer;
        } else {
          console.error('Unrecognized entry "%s".', fileName);
          entry.autodrain();
        }
      }
    }

    const subObjects = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    // challenges
    for (const gedilId of Object.keys(entries.challenges)) {
      subObjects.challenges[gedilId] = await this.challengeService.importGEdIL(
        subObjects,
        game,
        gedilId,
        entries.challenges[gedilId],
      );
    }

    // leaderboards
    for (const gedilId of Object.keys(entries.leaderboards)) {
      subObjects.leaderboards[gedilId] = await this.leaderboardService.importGEdIL(
        subObjects,
        game,
        entries.leaderboards[gedilId],
      );
    }

    // rewards
    for (const gedilId of Object.keys(entries.rewards)) {
      subObjects.rewards[gedilId] = await this.rewardService.importGEdIL(subObjects, game, entries.rewards[gedilId]);
    }

    // rules
    for (const gedilId of Object.keys(entries.rules)) {
      subObjects.rules[gedilId] = await this.hookService.importGEdIL(subObjects, game, entries.rules[gedilId]);
    }

    const now = new Date().getTime();
    if (!game.startDate && !game.endDate) {
      game = await this.patch(game.id, { state: GameStateEnum.OPEN });
    } else {
      if (!game.startDate && game.endDate.getTime() <= now) {
        game = await this.patch(game.id, { state: GameStateEnum.CLOSED });
      } else if (!game.startDate && game.endDate.getTime() > now) {
        game = await this.patch(game.id, { state: GameStateEnum.OPEN });
      } else if (!game.endDate && game.startDate.getTime() > now) {
        game = await this.patch(game.id, { state: GameStateEnum.LOCKED });
      } else if (!game.endDate && game.startDate.getTime() <= now) {
        game = await this.patch(game.id, { state: GameStateEnum.OPEN });
      } else {
        if (game.startDate.getTime() > game.endDate.getTime()) {
          throw new BadRequestException('Start date after end date');
        }
        if (now >= game.startDate.getTime() && now < game.endDate.getTime()) {
          game = await this.patch(game.id, { state: GameStateEnum.OPEN });
        } else if (now < game.startDate.getTime()) {
          game = await this.patch(game.id, { state: GameStateEnum.LOCKED });
        } else if (now >= game.endDate.getTime()) {
          game = await this.patch(game.id, { state: GameStateEnum.CLOSED });
        }
      }

      // add scheduled hooks for start and end of the game
      if (game.startDate) {
        await this.scheduledHookService.create({
          game: game.id?.toString(),
          cron: game.startDate,
          actions: [
            {
              type: CategoryEnum.UPDATE,
              parameters: ['GAME', 'STATE', GameStateEnum.OPEN],
            },
          ],
          recurrent: false,
          active: game.startDate.getTime() > now,
        });
      }
      if (game.endDate) {
        await this.scheduledHookService.create({
          game: game.id?.toString(),
          cron: game.endDate,
          actions: [
            {
              type: CategoryEnum.UPDATE,
              parameters: ['GAME', 'STATE', GameStateEnum.CLOSED],
            },
          ],
          recurrent: false,
          active: game.endDate.getTime() > now,
        });
      }
    }

    this.logger.warn(`${game.state} ${game.startDate} ${game.endDate}`);

    await this.scheduledHookService.schedulingRoutine(game.id);

    return game;
  }

  /**
   * Assigns a user as instructor in a game.
   *
   * @param {string} gameId ID of the game.
   * @param {string} userId ID of the user.
   * @return {Game} game w/ new instructor.
   */
  async assignInstructor(gameId: string, userId: string): Promise<Game> {
    const user: UserDto = await this.userService.getUser(userId);
    return this.findOneAndUpdate({ _id: { $eq: gameId } }, { $addToSet: { instructors: user.id } });
  }

  /**
   * Check if a user is assigned as instructor in a game.
   *
   * @param {string} gameId ID of the game.
   * @param {string} userId ID of the user.
   */
  async isInstructor(gameId: string, userId: string): Promise<boolean> {
    const game: Game = await this.findById(gameId);
    return game.instructors?.includes(userId);
  }

  /**
   * Generate token to enroll automatically in game.
   *
   * @param {string} gameId ID of the game.
   */
  async generateEnrollToken(gameId: string): Promise<TokenDto> {
    const game: Game = await this.findById(gameId);
    if (!game) {
      throw new NotFoundException();
    }
    const token = createToken(
      { gameId: game.id },
      appConfig.generatedTokens.timeout,
      appConfig.generatedTokens.secret,
      appConfig.host,
      appConfig.uuid,
    );
    return {
      token,
      expiresIn: appConfig.generatedTokens.timeout,
    };
  }

  /**
   * Verify token to enroll automatically in game.
   *
   * @param token the token
   */
  async verifyEnrollToken(token: string): Promise<{ [k: string]: any }> {
    const payload = await verifyToken(token, appConfig.generatedTokens.secret);
    if (!payload.gameId) {
      throw new BadRequestException('Not a token for enrolling in a game');
    }
    return payload;
  }
}
