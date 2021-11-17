import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../../app.config';
import { ActionHookService } from '../../hook/action-hook.service';
import { TriggerEventEnum as TriggerEvent } from '../../hook/enums/trigger-event.enum';
import { HookService } from '../../hook/hook.service';
import { EventService } from '../event.service';
import { Player } from '../../player/models/player.model';
import { PlayerService } from '../../player/player.service';
import { ChallengeService } from '../../challenge/challenge.service';
import { Challenge } from '../../challenge/models/challenge.model';
import { StateEnum } from '../../challenge-status/models/state.enum';
import { ChallengeStatus } from '../../challenge-status/models/challenge-status.model';
import { ChallengeStatusService } from '../../challenge-status/challenge-status.service';
import { RewardService } from '../../reward/reward.service';
import { Mode } from 'src/challenge/models/mode.enum';
import { ScheduledHookService } from 'src/hook/scheduled-hook.service';

@Processor(appConfig.queue.event.name)
export class PlayerProcessor {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly eventService: EventService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly rewardService: RewardService,
  ) {}

  @Process(`${TriggerEvent.PLAYER_ENROLLED}_JOB`)
  async onPlayerEnrolled(job: Job<{ gameId: string; playerId: string }>): Promise<void> {
    const { gameId, playerId } = job.data;

    // prepare challenges for new player
    const player: Player = await this.playerService.findById(playerId);

    const challengeTree = await this.challengeService.challengeTree(gameId);
    for (const challenge of challengeTree) {
      await this.prepareChallenges(player, challenge);
    }

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.PLAYER_ENROLLED,
    });

    for (const actionHook of actionHooks) {
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      // execute hook
      await this.hookService.executeHook(actionHook, job.data, {});

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }
  }

  @Process(`${TriggerEvent.PLAYER_LEFT}_JOB`)
  async onPlayerLeft(job: Job<{ gameId: string; playerId: string }>): Promise<void> {
    const { gameId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.PLAYER_LEFT,
    });

    for (const actionHook of actionHooks) {
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      // execute hook
      await this.hookService.executeHook(actionHook, job.data, {});

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }
  }

  @Process(`${TriggerEvent.PLAYER_UPDATED}_JOB`)
  async onPlayerUpdated(job: Job<{ gameId: string; playerId: string }>): Promise<void> {
    const { gameId, playerId } = job.data;

    // process hooks
    const actionHooks = await this.actionHookService.findAll({
      game: { $eq: gameId },
      trigger: TriggerEvent.PLAYER_UPDATED,
    });

    for (const actionHook of actionHooks) {
      // if not recurrent, do not execute a second time
      if (!actionHook.recurrent) {
        const executed = await this.eventService.hasEventLogsMatching({
          game: gameId,
          player: playerId,
          actionHook: actionHook.id,
        });

        if (executed) continue;
      }

      // execute hook
      await this.hookService.executeHook(actionHook, job.data, {});

      // add event log
      await this.eventService.createEventLog({
        game: gameId,
        player: playerId,
        actionHook: actionHook.id,
        timestamp: new Date(),
      });
    }
  }

  async prepareChallenges(
    player: Player,
    challenge: Challenge & { children: any },
    state = StateEnum.AVAILABLE,
  ): Promise<ChallengeStatus> {
    // infer state for current challenge
    let challengeState: StateEnum;
    let openingDate: Date = null;
    const referenceDate: Date = new Date();

    if (challenge.hidden) {
      challengeState = StateEnum.HIDDEN;
    } else if (challenge.locked && state === StateEnum.AVAILABLE) {
      challengeState = StateEnum.LOCKED;
    } else if (challenge.mode == Mode.NORMAL) {
      challengeState = StateEnum.AVAILABLE;
    } else {
      challengeState = StateEnum.OPENED;
      openingDate = referenceDate;
    }

    // create state of player in challenge
    let challengeStatus: ChallengeStatus = {
      player: player.id,
      challenge: challenge.id,
      startedAt: referenceDate,
      openedAt: openingDate,
      state: challengeState,
    };

    if (challengeStatus.state === StateEnum.OPENED && challenge.mode === Mode.TIME_BOMB) {
      challengeStatus = {
        ...challengeStatus,
        endedAt: new Date(referenceDate.getTime() + Number.parseInt(challenge.modeParameters[0])),
      };
      await this.scheduledHookService.createTimebombHook(challenge, player.id);
    }
    await this.challengeStatusService.create(challengeStatus);

    // prepare sub-tree
    for (const child of challenge.children) {
      await this.prepareChallenges(player, child, challengeState);
    }

    return challengeStatus;
  }
}
