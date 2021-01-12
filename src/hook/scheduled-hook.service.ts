import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHook, ScheduledHookDocument } from './models/scheduled-hook.model';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { HookService } from './hook.service';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook, ScheduledHookDocument> {
  constructor(
    protected readonly repository: ScheduledHookRepository,
    @Inject(forwardRef(() => HookService))
    protected readonly hookService: HookService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    super(new Logger(ScheduledHookService.name), repository);
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
      this.logger.warn(`Cronjob for game ${hook.game} has been created with ${cron} interval.`);
      this.hookService.executeHook(hook, eventParams);
    });
    this.schedulerRegistry.addCronJob(hook.game, job);
    job.start();
  }

  addInterval(hook: ScheduledHook, eventParams: { [key: string]: any }, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Interval for game ${hook.game} is set to ${milliseconds}s.`);
      this.hookService.executeHook(hook, eventParams);
    };

    const interval = setInterval(callback, milliseconds);
    this.schedulerRegistry.addInterval(hook.game, interval);
  }

  addTimeout(hook: ScheduledHook, eventParams: { [key: string]: any }, milliseconds: number) {
    const callback = () => {
      this.logger.warn(`Timeout for game ${hook.game} is set to ${milliseconds}s.`);
      this.hookService.executeHook(hook, eventParams);
    };

    const timeout = setTimeout(callback, milliseconds);
    this.schedulerRegistry.addTimeout(hook.game, timeout);
  }
}
