import { forwardRef, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHook, ScheduledHookDocument } from './models/scheduled-hook.model';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { HookService } from './hook.service';
import { GameService } from 'src/game/game.service';
import { Game } from 'src/game/models/game.model';
import { StateEnum } from 'src/challenge-status/models/state.enum';
import { CategoryEnum } from './enums/category.enum';
import { EntityEnum } from './enums/entity.enum';
import { ComparingFunctionEnum as ComparingFunction } from './enums/comparing-function.enum';
import { ChallengeDto } from 'src/challenge/dto/challenge.dto';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook, ScheduledHookDocument> implements OnModuleInit {
  constructor(
    protected readonly repository: ScheduledHookRepository,
    @Inject(forwardRef(() => HookService))
    protected readonly hookService: HookService,
    protected readonly gameService: GameService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    super(new Logger(ScheduledHookService.name), repository);
  }

  async onModuleInit(): Promise<void> {
    const games: Game[] = await this.gameService.findAll();
    games.forEach(game => {
      this.schedulingRoutine(game.id);
    });
  }

  /**
   * Find all hooks within a specific game.
   *
   * @param {string} gameId the ID of the game
   * @returns {Promise<ScheduledHook[]>} the hooks.
   */
  async findByGameId(gameId: string): Promise<ScheduledHook[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }

  /**
   * Triggers active hooks within specific game.
   *
   * @param {string} gameId the ID of the game
   */
  async schedulingRoutine(gameId: string) {
    let scheduledHooks: ScheduledHook[] = await this.findByGameId(gameId);
    scheduledHooks = scheduledHooks.filter(hook => hook.active === true);
    this.executeScheduledHooks(scheduledHooks, {});
  }

  /**
   * Adds cron job, interval or timeout for each hook accordingly.
   *
   * @param {ScheduledHook[]} scheduledHooks array of scheduled hooks
   * @param {{ [key: string]: any }} eventParams parameters needed for hook execution
   */
  executeScheduledHooks(scheduledHooks: ScheduledHook[], eventParams: { [key: string]: any }) {
    for (const scheduledHook of scheduledHooks) {
      if (scheduledHook.cron && !scheduledHook.interval) this.addCronJob(scheduledHook, eventParams);
      if (scheduledHook.interval && !scheduledHook.cron) {
        if (scheduledHook.recurrent) this.addInterval(scheduledHook, eventParams);
        else this.addTimeout(scheduledHook, eventParams);
      }
    }
  }

  /**
   * Adds a cron job for a hook.
   *
   * @param {ScheduledHook} hook the scheduled hook
   * @param {{ [key: string]: any }} eventParams parameters needed for hook execution
   */
  addCronJob(hook: ScheduledHook, eventParams: { [key: string]: any }) {
    const job = new CronJob(hook.cron, () => {
      this.logger.warn(`Cronjob for ${hook.id} has been created with ${hook.cron} interval.`);
      this.hookService.executeHook(hook, eventParams);
    });
    this.schedulerRegistry.addCronJob(hook.id, job);
    job.start();
  }

  /**
   * Adds an interval for a hook.
   * @param {ScheduledHook} hook the scheduled hook
   * @param {{ [key: string]: any }} eventParams parameters needed for hook execution
   */
  addInterval(hook: ScheduledHook, eventParams: { [key: string]: any }) {
    const callback = () => {
      this.logger.warn(`Interval for ${hook.id} is set to ${hook.interval}s.`);
      this.hookService.executeHook(hook, eventParams);
    };

    const interval = setInterval(callback, hook.interval);
    this.schedulerRegistry.addInterval(hook.id, interval);
  }

  /**
   * Adds a timeout for a hook.
   *
   * @param {ScheduledHook} hook the scheduled hook
   * @param {{ [key: string]: any }} eventParams parameters needed for hook execution
   */
  addTimeout(hook: ScheduledHook, eventParams: { [key: string]: any }) {
    const callback = () => {
      this.logger.warn(`Timeout for ${hook.id} is set to ${hook.interval}s.`);
      this.hookService.executeHook(hook, eventParams);
      this.patch(hook.id, { active: false });
    };

    const timeout = setTimeout(callback, hook.interval);
    this.schedulerRegistry.addTimeout(hook.id, timeout);
  }

  /**
   * Creates a hook for Timebomb challenge
   * and adds a timeout for it.
   *
   * @param {ChallengeDto} challenge the challenge
   * @param {string} playerId the ID of the player
   */
  async createTimebombHook(challenge: ChallengeDto, playerId: string) {
    const scheduledHook: ScheduledHook = await this.create({
      game: challenge.game,
      parentChallenge: challenge.id,
      criteria: {
        conditions: [
          {
            order: 0,
            leftEntity: EntityEnum.PLAYER,
            leftProperty: `$.learningPath[?(@.challenge==\'${challenge.id}\')].state`,
            comparingFunction: ComparingFunction.NOT_EQUAL,
            rightEntity: EntityEnum.FIXED,
            rightProperty: StateEnum.COMPLETED,
          },
        ],
        junctors: [],
      },
      actions: [
        {
          type: CategoryEnum.UPDATE,
          parameters: ['CHALLENGE', challenge.id as string, 'STATE', StateEnum.FAILED],
        },
      ],
      recurrent: false,
      interval: +challenge.modeParameters[0],
      active: true,
    });
    this.addTimeout(scheduledHook, {
      gameId: challenge.game,
      playerId: playerId,
      challengeId: challenge.id,
    });
  }

  /**
   * Stops particular cron job.
   *
   * @param {string} hookId the ID of the hook
   */
  stopCronJob(hookId: string) {
    const job = this.schedulerRegistry.getCronJob(hookId);
    job.stop();
  }
}
