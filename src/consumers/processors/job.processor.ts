import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { checkCriteria } from '../../common/helpers/criteria.helper';
import { ActionEmbedDto } from '../../hook/dto/embedded/action.dto';
import { CategoryEnum as Category } from '../../hook/enums/category.enum';
import { ActionHook } from '../../hook/models/action-hook.model';
import { ScheduledHook } from '../../hook/models/scheduled-hook.model';
import { SubmissionService } from '../../submission/submission.service';
import { PlayerService } from '../../player/player.service';
import { PlayerRewardService } from 'src/player-reward/player-reward.service';
import { PlayerReward } from 'src/player-reward/models/player-reward.model';
import { ChallengeStatusService } from 'src/challenge-status/challenge-status.service';
import { State } from 'src/challenge-status/models/state.enum';
import { RewardType } from 'src/reward/models/reward-type.enum';
import { Reward } from 'src/reward/models/reward.model';
import { RewardService } from 'src/reward/reward.service';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly submissionService: SubmissionService,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly rewardService: RewardService,
  ) {}

  @Process()
  async hookExecution(job: Job<unknown>): Promise<any> {
    let hook: ActionHook | ScheduledHook;
    if (typeof job.data['hook']['trigger'] !== undefined) {
      hook = job.data['hook'] as ActionHook;
    } else {
      hook = job.data['hook'] as ScheduledHook;
    }
    const meet = checkCriteria(hook.criteria, job.data['params'], {
      player: (id: string) => this.playerService.findById(id),
      submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }),
      players: () => this.playerService.findAll({ game: { $eq: hook.game } }),
    });
    if (meet) {
      this.runActions(hook.actions, job.data['params']);
    }
  }

  async runActions(actions: ActionEmbedDto[], params: string[]): Promise<any> {
    actions.forEach(action => {
      const props: string[] = action.parameters;
      switch (action.type) {
        case Category.GIVE:
          this.runGiveActions(props, params['playerId'], params['challengeId'] || null);
          break;
        case Category.TAKE:
          this.runTakeActions(props, params['playerId']);
          break;
        case Category.UPDATE:
          this.runUpdateActions(props, params['playerId'], params['challengeId'] || null);
          break;
      }
    });
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
      this.updatePlayer(parameters, playerId, challengeId);
    } else {
      this.updateChallengeState(parameters, playerId);
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
        await this.challengeStatusService.markAsFailed(param[2], playerId);
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
      //more cases can be later added
      case 'points':
        await this.updatePlayerPoints(param, playerId, challengeId);
        break;
    }

    //send CHALLENGE_COMPLETED message to execute attached hooks

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
  async updatePlayerPoints(param: string[], playerId: string, challengeId: string) {
    if (param[2].startsWith('+')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: +param[2].substring(1) } });
    } else if (param[2].startsWith('-')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: -param[2].substring(1) } });
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { points: +param });
    }

    //send POINTS_UPDATED message to execute attached hooks

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
