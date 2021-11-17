import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { ActionHookService } from '../../hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { HookService } from '../../hook/hook.service';
import { EventService } from '../event.service';
import { ValidationService } from '../../submission/validation.service';
import { PlayerService } from '../../player/player.service';

@Processor(appConfig.queue.event.name)
export class ValidationProcessor {
  constructor(
    protected readonly validationService: ValidationService,
    protected readonly eventService: EventService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
    protected readonly playerService: PlayerService,
  ) {}

  @Process(`${TriggerEvent.VALIDATION_RECEIVED}_JOB`)
  async onValidationReceived(job: Job<{ gameId: string; exerciseId: string; playerId: string }>): Promise<void> {
    const { gameId, exerciseId, playerId } = job.data;
    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      $and: [
        { game: { $eq: gameId } },
        { trigger: TriggerEvent.VALIDATION_RECEIVED },
        { $or: [{ sourceId: { $eq: exerciseId } }, { sourceId: { $eq: null } }] },
      ],
    });

    for (const actionHook of actionHooks) {
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          activityId: exerciseId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        activityId: exerciseId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }
  }

  @Process(`${TriggerEvent.VALIDATION_PROCESSED}_JOB`)
  async onValidationProcessed(
    job: Job<{ gameId: string; validationId: string; exerciseId: string; playerId: string }>,
  ): Promise<void> {
    const { gameId, validationId, exerciseId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.VALIDATION_PROCESSED,
      $or: [{ sourceId: { $exists: false } }, { sourceId: { $eq: exerciseId } }],
    });

    for (const actionHook of actionHooks) {
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          activityId: exerciseId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      await this.hookService.executeHook(actionHook, job.data, { exerciseId: exerciseId });

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        activityId: exerciseId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }

    // send notification to trigger further processing
    await this.eventService.fireEvent(TriggerEvent.VALIDATION_PROCESSED, {
      gameId,
      validationId,
      playerId,
      exerciseId,
    });

    // invalidate caches
    await this.playerService.invalidateCaches(playerId);
  }
}
