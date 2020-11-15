import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from 'src/app.config';
import { ChallengeStatusService } from 'src/challenge-status/challenge-status.service';
import { ChallengeStatus } from 'src/challenge-status/models/challenge-status.model';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Challenge } from 'src/challenge/models/challenge.model';
import { ActionHookService } from 'src/hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from 'src/hook/enums/trigger-event.enum';
import { HookService } from 'src/hook/hook.service';
import { StateEnum as State } from '../../challenge-status/models/state.enum';

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
}
