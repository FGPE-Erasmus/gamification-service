import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { HookService } from '../../hook/hook.service';
import { ActionHookService } from '../../hook/action-hook.service';
import { RewardService } from '../../reward/reward.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { RewardType } from '../../reward/models/reward-type.enum';
import { ChallengeStatusService } from '../../challenge-status/challenge-status.service';
import { toString } from '../../common/utils/mongo.utils';
import { ChallengeService } from '../../challenge/challenge.service';
import { PlayerService } from '../../player/player.service';
import { EventService } from '../event.service';

@Processor(appConfig.queue.event.name)
export class RewardProcessor {
  constructor(
    protected readonly rewardService: RewardService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly challengeService: ChallengeService,
    protected readonly hookService: HookService,
    protected readonly playerService: PlayerService,
    protected readonly actionHookService: ActionHookService,
    protected readonly eventService: EventService,
  ) {}

  @Process(`${TriggerEvent.REWARD_GRANTED}_JOB`)
  async onRewardGranted(job: Job<{ gameId: string; rewardId: string; playerId: string }>): Promise<void> {
    const { gameId, rewardId, playerId } = job.data;

    const reward = await this.rewardService.findById(rewardId, undefined, { lean: true });

    if (reward.kind === RewardType.REVEAL) {
      for (const challengeId of reward.challenges) {
        await this._changeRevealingStatus(gameId, challengeId, playerId);
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
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          reward: rewardId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      await this.hookService.executeHook(actionHook, job.data, { ...reward });

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        reward: rewardId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }

    // invalidate caches
    await this.playerService.invalidateCaches(playerId);
  }

  async _changeRevealingStatus(gameId, challengeId, playerId) {
    if (await this._ifLocked(challengeId)) {
      await this.challengeStatusService.markAsLocked(gameId, toString(challengeId), playerId);
    } else {
      await this.challengeStatusService.markAsAvailable(gameId, toString(challengeId), playerId);
    }
  }

  async _ifLocked(challengeId): Promise<boolean> {
    const challenge = await this.challengeService.findById(challengeId);
    return challenge.locked ? true : false;
  }
}
