import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { PlayerService } from '../../player/player.service';
import { ChallengeService } from '../../challenge/challenge.service';
import { EventService } from '../event.service';
import { HookService } from '../../hook/hook.service';
import { ActionHookService } from '../../hook/action-hook.service';
import { RewardService } from '../../reward/reward.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { RewardType } from '../../reward/models/reward-type.enum';
import { ChallengeStatusService } from '../../challenge-status/challenge-status.service';
import { toString } from '../../common/utils/mongo.utils';

@Processor(appConfig.queue.event.name)
export class RewardProcessor {
  constructor(
    protected readonly rewardService: RewardService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
  ) {}

  @Process(`${TriggerEvent.REWARD_GRANTED}_JOB`)
  async onRewardGranted(job: Job<{ gameId: string; rewardId: string; playerId: string }>): Promise<void> {
    const { gameId, rewardId, playerId } = job.data;

    const reward = await this.rewardService.findById(rewardId, undefined, { lean: true });

    if (reward.kind === RewardType.REVEAL) {
      for (const challengeId of reward.challenges) {
        await this.challengeStatusService.markAsAvailable(gameId, toString(challengeId), playerId);
      }
    } else if (reward.kind === RewardType.UNLOCK) {
      for (const challengeId of reward.challenges) {
        await this.challengeStatusService.markAsOpen(gameId, toString(challengeId), playerId, new Date());
      }
    }

    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.REWARD_GRANTED,
      sourceId: rewardId,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, { ...reward });
    }
  }
}