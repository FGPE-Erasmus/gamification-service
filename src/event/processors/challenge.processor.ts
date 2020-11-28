import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { ChallengeStatusService } from '../../challenge-status/challenge-status.service';
import { ChallengeService } from '../../challenge/challenge.service';
import { Challenge } from '../../challenge/models/challenge.model';
import { ActionHookService } from '../../hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { HookService } from '../../hook/hook.service';

@Processor(appConfig.queue.event.name)
export class ChallengeProcessor {
  constructor(
    protected readonly actionHookService: ActionHookService,
    protected readonly hookService: HookService,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeStatusService: ChallengeStatusService,
  ) {}

  @Process(`${TriggerEvent.CHALLENGE_COMPLETED}_JOB`)
  async onChallengeCompleted(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);
    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_COMPLETED,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }

  @Process(`${TriggerEvent.CHALLENGE_OPENED}_JOB`)
  async onChallengeOpened(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_OPENED,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }

  @Process(`${TriggerEvent.CHALLENGE_REJECTED}_JOB`)
  async onChallengeRejected(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_REJECTED,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }

  @Process(`${TriggerEvent.CHALLENGE_FAILED}_JOB`)
  async onChallengeFailed(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_FAILED,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }

  @Process(`${TriggerEvent.CHALLENGE_HIDDEN}_JOB`)
  async onChallengeHidden(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_HIDDEN,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }

  @Process(`${TriggerEvent.CHALLENGE_AVAILABLE}_JOB`)
  async onChallengeAvailable(job: Job<{ gameId: string; challengeId: string; playerId: string }>): Promise<void> {
    const { gameId, challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.CHALLENGE_AVAILABLE,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }
}
