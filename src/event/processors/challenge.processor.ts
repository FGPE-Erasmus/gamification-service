import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from 'src/app.config';
import { ChallengeService } from 'src/challenge/challenge.service';
import { Challenge } from 'src/challenge/models/challenge.model';
import { ActionHookService } from 'src/hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from 'src/hook/enums/trigger-event.enum';
import { HookService } from 'src/hook/hook.service';

@Processor(appConfig.queue.event.name)
export class ChallengeProcessor {
  constructor(
    protected readonly actionHookService: ActionHookService,
    protected readonly hookService: HookService,
    protected readonly challengeService: ChallengeService,
  ) {}

  @Process(`${TriggerEvent.CHALLENGE_COMPLETED}_JOB`)
  async onChallengeCompleted(job: Job<{ challengeId: string; playerId: string }>): Promise<void> {
    const { challengeId, playerId } = job.data;
    const challenge: Challenge = await this.challengeService.findById(challengeId);

    //process hooks
    const actionHooks = await this.actionHookService.findAll({
      trigger: TriggerEvent.CHALLENGE_COMPLETED,
      sourceId: challengeId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...challenge });
    }
  }
}
