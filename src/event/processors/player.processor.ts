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

@Processor(appConfig.queue.event.name)
export class PlayerProcessor {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly challengeService: ChallengeService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly eventService: EventService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
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
      game: gameId,
      trigger: TriggerEvent.PLAYER_ENROLLED,
    });

    for (const actionHook of actionHooks) {
      await this.hookService.executeHook(actionHook, job.data, {});
    }
  }

  async prepareChallenges(
    player: Player,
    challenge: Challenge & { children: any },
    state = StateEnum.AVAILABLE,
  ): Promise<ChallengeStatus> {
    // infer state for current challenge
    let challengeState: StateEnum = StateEnum.AVAILABLE;
    if (challenge.hidden) {
      challengeState = StateEnum.HIDDEN;
    } else if (challenge.locked && state === StateEnum.AVAILABLE) {
      challengeState = StateEnum.LOCKED;
    } else {
      challengeState = StateEnum.AVAILABLE;
    }

    // create state of player in challenge
    const challengeStatus = await this.challengeStatusService.create({
      player: player.id,
      challenge: challenge.id,
      startedAt: new Date(),
      state: challengeState,
    });

    // prepare sub-tree
    for (const child of challenge.children) {
      await this.prepareChallenges(player, child, challengeState);
    }

    return challengeStatus;
  }
}
