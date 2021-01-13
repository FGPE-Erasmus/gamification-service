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
   * @param gameId the ID of the game
   * @returns {Promise<ScheduledHook[]>} the hooks.
   */
  async findByGameId(gameId: string): Promise<ScheduledHook[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }

  async schedulingRoutine(gameId: string) {
    let scheduledHooks: ScheduledHook[] = await this.findByGameId(gameId);
    scheduledHooks = scheduledHooks.filter(hook => hook.active === true);
    this.executeScheduledHooks(scheduledHooks, {});
  }

  executeScheduledHooks(scheduledHooks: ScheduledHook[], eventParams: { [key: string]: any }) {
    for (const scheduledHook of scheduledHooks) {
      if (scheduledHook.cron && !scheduledHook.interval)
        this.addCronJob(scheduledHook.game, eventParams, scheduledHook.cron);
      if (scheduledHook.interval && !scheduledHook.cron) {
        if (scheduledHook.recurrent) this.addInterval(scheduledHook.game, eventParams, scheduledHook.interval);
        else this.addTimeout(scheduledHook.game, eventParams, scheduledHook.interval);
      }
    }
  }

  addCronJob(hook: ScheduledHook, eventParams: { [key: string]: any }, cron: string) {
    const job = new CronJob(cron, () => {
      this.logger.warn(`Cronjob for ${hook.id} has been created with ${cron} interval.`);
      this.hookService.executeHook(hook, eventParams);
    });
    this.schedulerRegistry.addCronJob(hook.id, job);
    job.start();
  }

  addInterval(hook: ScheduledHook, eventParams: { [key: string]: any }, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Interval for ${hook.id} is set to ${milliseconds}s.`);
      this.hookService.executeHook(hook, eventParams);
    };

    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(hook.id, interval);
  }

  addTimeout(hook: ScheduledHook, eventParams: { [key: string]: any }, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Timeout for ${hook.id} is set to ${milliseconds}s.`);
      this.hookService.executeHook(hook, eventParams);
      this.patch(hook.id, { active: false });
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(hook.id, timeout);
  }

  async createTimebombHook(gameId, playerId, challenge) {
    const scheduledHook: ScheduledHook = await this.create({
      game: gameId,
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
    this.addTimeout(
      scheduledHook,
      {
        gameId: gameId,
        playerId: playerId,
        challengeId: challenge.id,
      },
      scheduledHook.interval,
    );
  }

  async createShapeshifterHook() {
    // TODO
  }
}
