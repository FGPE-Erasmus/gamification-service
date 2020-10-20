import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { appConfig } from '../app.config';
import { checkCriteria } from '../common/helpers/criteria.helper';
import { StateEnum as State } from '../challenge-status/models/state.enum';
import { CategoryEnum as Category } from '../hook/enums/category.enum';
import { HookService } from '../hook/hook.service';
import { ActionHook } from '../hook/models/action-hook.model';
import { ActionEmbed } from '../hook/models/embedded/action.embed';
import { ScheduledHook } from '../hook/models/scheduled-hook.model';
import { PlayerService } from '../player/player.service';
import { RewardService } from '../reward/reward.service';
import { SubmissionService } from '../submission/submission.service';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { RewardType } from '../reward/models/reward-type.enum';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { PlayerReward } from '../player-reward/models/player-reward.model';
import { Reward } from '../reward/models/reward.model';

@Processor(appConfig.queue.event.name)
export class EventProcessor {
  constructor(
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly hookService: HookService,
    protected readonly playerService: PlayerService,
    protected readonly rewardService: RewardService,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly submissionService: SubmissionService,
  ) {}

  @Process()
  async hookExecution(job: Job<unknown>): Promise<any> {
    let hook: ActionHook | ScheduledHook;
    if (typeof job.data['hook']['trigger'] !== undefined) {
      hook = job.data['hook'] as ActionHook;
    } else {
      hook = job.data['hook'] as ScheduledHook;
    }
    const meet = checkCriteria(
      hook.criteria,
      job.data['params'],
      {},
      {
        player: (id: string) => this.playerService.findById(id),
        submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }),
        players: () => this.playerService.findAll({ game: { $eq: hook.game } }),
      },
    );
    if (meet) {
      this.runActions(hook.actions, job.data['params']);
    }
  }

  async runActions(actions: ActionEmbed[], params: string[]): Promise<any> {
    for (const action of actions) {
      const props: string[] = action.parameters;
      switch (action.type) {
        case Category.GIVE:
          await this.runGiveActions(props, params['playerId'], params['challengeId'] || null);
          break;
        case Category.TAKE:
          await this.runTakeActions(props, params['playerId']);
          break;
        case Category.UPDATE:
          await this.runUpdateActions(props, params['playerId'], params['challengeId'] || null);
          break;
      }
    }
  }

  /**
   * Runs actions with type "GIVE", parameters are string arrays with two strings inside.
   * Parameter is structured as ["rewardId/points_nr", quantity].
   * If quantity is not provided - default (1) is applied.
   * @param parameters - string array
   * @param playerId - id of the player
   */
  async runGiveActions(parameters: string[] | string, playerId: string, challengeId?: string) {
    const reward: Reward = await this.rewardService.findById(parameters[0]);
    const quantity: number = parameters[1] ? +parameters[1] : 1;
    if (parameters[0] !== 'points') {
      await this.playerRewardService.findOneAndUpdate(
        {
          player: playerId,
          reward: parameters[0],
        },
        { $inc: { count: quantity } },
        { upsert: true, setDefaultsOnInsert: true },
      );
      if (reward.kind === RewardType.REVEAL) await this.challengeStatusService.markAsAvailable(challengeId, playerId);
      else if (reward.kind === RewardType.UNLOCK)
        await this.challengeStatusService.markAsOpen(challengeId, playerId, new Date());
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: quantity } });
    }
  }

  /**
   * Runs actions with type "TAKE", parameters are string arrays with two strings inside.
   * Parameter is structured as ["rewardId/points_nr", quantity].
   * If quantity is not provided - default (1) is applied.
   * @param parameters - string array
   * @param playerId - id of the player
   */
  async runTakeActions(parameters: string[] | string, playerId: string) {
    const quantity: number = parameters[1] ? +parameters[1] : 1;
    if (parameters[0] !== 'points') {
      const x: PlayerReward = await this.playerRewardService.findOneAndUpdate(
        { player: playerId, reward: parameters[0] },
        { $inc: { count: -quantity } },
        { new: true },
      );
      if (x.count <= 0) {
        await this.playerRewardService.deleteOne({
          player: playerId,
          reward: parameters,
        });
      }
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: -quantity } }, { new: true });
    }
  }

  /**
   Runs actions with type "UPDATE", parameters are string arrays with either 3 or 4 arguments.
   * Parameter is structured as ["player or challenge", "challengeId (if challenge)", "prop", "newValue"].
   * @param parameters - string array
   * @param playerId - id of the player
   */
  async runUpdateActions(parameters: string[], playerId: string, challengeId?: string) {
    if (parameters[0] === 'player') {
      await this.updatePlayer(parameters, playerId, challengeId);
    } else {
      await this.updateChallengeState(parameters, playerId);
    }
  }

  /**
   * Updates the status of the challenge
   */
  async updateChallengeState(param: string[], playerId: string) {
    switch (param[3]) {
      case State.AVAILABLE:
        await this.challengeStatusService.markAsAvailable(param[2], playerId);
        break;
      case State.LOCKED:
        await this.challengeStatusService.markAsLocked(param[2], playerId);
        break;
      case State.HIDDEN:
        await this.challengeStatusService.markAsHidden(param[2], playerId);
        break;
      case State.OPENED:
        await this.challengeStatusService.markAsOpen(param[2], playerId, new Date());
        break;
      case State.FAILED:
        await this.challengeStatusService.markAsFailed(param[2], playerId, new Date());
        break;
      case State.COMPLETED:
        await this.challengeStatusService.markAsCompleted(param[2], playerId, new Date());
        break;
      case State.REJECTED:
        await this.challengeStatusService.markAsRejected(param[2], playerId);
        break;
    }
  }

  /**
   * Updates player properties.
   */
  async updatePlayer(param: string[], playerId: string, challengeId: string) {
    switch (param[1]) {
      // more cases can be later added
      case 'points':
        await this.updatePlayerPoints(param, playerId);
        break;
      default:
        break;
    }

    // send CHALLENGE_COMPLETED message to execute attached hooks

    // const hooks: ActionHook[] = await this.actionHookService.findAll({
    //   $and: [{ trigger: { $eq: TriggerEvent.PLAYER_UPDATED } }, { sourceId: { $eq: challengeId } }],
    // });
    // for (const hook of hooks) {
    //   const job = await this.hooksQueue.add({
    //     hook: hook,
    //     params: {
    //       playerId: playerId
    //     },
    //   });
    // }
  }

  /**
   * Updates players points.
   */
  async updatePlayerPoints(param: string[], playerId: string): Promise<void> {
    if (param[2].startsWith('+')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: +param[2].substring(1) } });
    } else if (param[2].startsWith('-')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: -param[2].substring(1) } });
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { points: +param });
    }

    // send POINTS_UPDATED message to execute attached hooks

    // const hooks: ActionHook[] = await this.actionHookService.findAll({
    //   $and: [{ trigger: { $eq: TriggerEvent.POINTS_UPDATED } }, { sourceId: { $eq: challengeId } }],
    // });
    // for (const hook of hooks) {
    //   const job = await this.hooksQueue.add({
    //     hook: hook,
    //     params: {
    //       playerId: playerId
    //     },
    //   });
    // }
  }
}
