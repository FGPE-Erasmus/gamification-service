import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class GameService extends BaseService<Game, GameDocument> {
  constructor(
    protected readonly repository: GameRepository,
    protected readonly userService: UserService,
    protected readonly rewardService: RewardService,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly notificationService: NotificationService,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    @Inject(forwardRef(() => ScheduledHookService)) protected readonly scheduledHookService: ScheduledHookService,
    @Inject(forwardRef(() => HookService)) protected readonly hookService: HookService,
  ) {
    super(new Logger(GameService.name), repository);
  }

  async create(input: Game): Promise<Game> {
    const result = await super.create(input);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  async update(id: string, input: Game): Promise<Game> {
    const result = await super.update(id, input);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  async patch(id: string, input: Partial<Game>): Promise<Game> {
    const result = await super.patch(id, input);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  async findOneAndUpdate(
    conditions: FilterQuery<GameDocument>,
    updates: UpdateQuery<GameDocument>,
    options?: Record<string, unknown>,
  ): Promise<Game> {
    const result = await super.findOneAndUpdate(conditions, updates, options);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  async delete(id: string, soft = false): Promise<Game> {
    const result = await super.delete(id, soft);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  async deleteOne(conditions: FilterQuery<GameDocument>, options?: Record<string, unknown>): Promise<Game> {
    const result = await super.deleteOne(conditions, options);
    this.notificationService.sendNotification(NotificationEnum.GAME_MODIFIED, result);
    return result;
  }

  /**
   * Import a game from a GEdIL layer archive.
   *
   * @param {GameInput} input the game attributes
   * @param {IFile} gedilFile the GEdIL specification package.
   */
  async importGEdILArchive(input: GameInput, gedilFile: IFile): Promise<Game | undefined> {
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

    //add scheduled hooks for start and end of the game
    if (game.startDate.getTime() < new Date().getTime() || !game.startDate) {
      await this.patch(game.id, { state: GameStateEnum.OPEN });
    } else {
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
        active: true,
      });
    }

    if (game.endDate) {
      if (game.endDate.getTime() < new Date().getTime()) {
        await this.patch(game.id, { state: GameStateEnum.CLOSED });
      } else {
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
          active: true,
        });
      }
    }

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
}
