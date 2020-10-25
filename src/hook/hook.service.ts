import { Injectable } from '@nestjs/common';

import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { TriggerKindEnum as TriggerKind } from './enums/trigger-kind.enum';
import { ScheduledHookService } from './scheduled-hook.service';
import { ActionHookService } from './action-hook.service';
import { ConditionInput } from './inputs/condition.input';
import { ScheduledHook } from './models/scheduled-hook.model';
import { ActionHook } from './models/action-hook.model';
import {
  markAsAvailable,
  markAsOpen,
  markAsLocked,
  markAsHidden,
  markAsFailed,
  markAsCompleted,
  markAsRejected,
} from 'src/challenge-status/challenge-status.service';
import { EventService } from 'src/event/event.service';
import { PlayerReward } from 'src/player-reward/models/player-reward.model';
import { RewardType } from 'src/reward/models/reward-type.enum';
import { Reward } from 'src/reward/models/reward.model';
import { ActionEmbed } from './models/embedded/action.embed';
import { StateEnum as State } from 'src/challenge-status/models/state.enum';
import { CategoryEnum as Category } from 'src/hook/enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from 'src/hook/enums/trigger-event.enum';
import { checkCriteria } from 'src/common/helpers/criteria.helper';
import { PlayerRewardService } from 'src/player-reward/player-reward.service';
import { PlayerService } from 'src/player/player.service';
import { RewardService } from 'src/reward/reward.service';
import { SubmissionService } from 'src/submission/submission.service';

@Injectable()
export class HookService {
  constructor(
    protected readonly actionHookService: ActionHookService,
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly playerService: PlayerService,
    protected readonly rewardService: RewardService,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly submissionService: SubmissionService,
    protected readonly eventService: EventService,
  ) {}

  async importGEdIL(
    imported: { [t in 'challenges' | 'leaderboards' | 'rewards' | 'rules']: { [k: string]: string } },
    game: Game,
    entries: { [path: string]: Buffer },
    parentChallenge?: Challenge,
  ): Promise<(ScheduledHook | ActionHook)[] | undefined> {
    const hooks: (ScheduledHook | ActionHook)[] = [];

    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);

      const triggers = encodedContent.triggers;
      for (const trigger of triggers) {
        let hook: ScheduledHook | ActionHook;

        const data: { [key: string]: any } = {
          game: game.id?.toString(),
          parentChallenge: parentChallenge?.id?.toString(),
          criteria: {
            ...encodedContent.criteria,
            conditions: HookService.transformConditions(encodedContent.criteria.conditions),
          },
          actions: encodedContent.actions,
          recurrent: trigger.recurrent,
          active: true,
        };
        if (trigger.kind === TriggerKind.ACTION) {
          hook = await this.actionHookService.create({
            ...data,
            trigger: trigger.event,
            sourceId: trigger.parameters[0],
          } as ActionHook);
        } else if (trigger.kind === TriggerKind.SCHEDULED) {
          if (trigger.event === 'INTERVAL') {
            data.interval = parseInt(trigger.parameters[0]);
          } else {
            data.cron = trigger.parameters[0];
          }
          hook = await this.scheduledHookService.create({
            ...data,
          } as ScheduledHook);
        }
        hooks.push(hook);
      }
    }

    return hooks;
  }

  /**
   * Find all hooks.
   *
   * @returns {Promise<(ActionHook | ScheduledHook)[]>} the hooks.
   */
  async findAll(): Promise<(ActionHook | ScheduledHook)[]> {
    return [...(await this.actionHookService.findAll()), ...(await this.scheduledHookService.findAll())];
  }

  /**
   * Finds an hook by its ID.
   *
   * @param {string} id of the hook
   * @returns {(Promise<ActionHook | ScheduledHook | undefined>)}
   * @memberOf ChallengeService
   */
  async findById(id: string): Promise<ActionHook | ScheduledHook | undefined> {
    let hook: ActionHook | ScheduledHook = await this.actionHookService.findById(id);
    if (!hook) {
      hook = await this.scheduledHookService.findById(id);
    }
    return hook;
  }

  /** Helpers */

  private static transformConditions(data: [{ [key: string]: any }]): ConditionInput[] {
    if (!data) {
      return [];
    }
    return data.map(condition => ({
      order: condition.order,
      leftEntity: condition.left_entity,
      leftProperty: condition.left_property,
      comparingFunction: condition.comparing_function,
      rightEntity: condition.right_entity,
      rightProperty: condition.right_property,
    }));
  }

  /** Hook execution helpers */

  async executeHook(
    hook: ActionHook | ScheduledHook,
    actionObj: { [key: string]: any },
    eventParams: { [key: string]: any },
  ): Promise<any> {
    const meet = checkCriteria(hook.criteria, eventParams, actionObj, {
      player: (id: string) => this.playerService.findById(id),
      submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }),
      players: () => this.playerService.findAll({ game: { $eq: hook.game } }),
    });
    if (meet) {
      this.runActions(hook.actions, eventParams);
    }
  }

  private async runActions(actions: ActionEmbed[], params: { [key: string]: any }): Promise<any> {
    for (const action of actions) {
      const props: { [key: string]: any } = action.parameters;
      switch (action.type) {
        case Category.GIVE:
          await this.runGiveActions(props, params.playerId, params.challengeId || null);
          break;
        case Category.TAKE:
          await this.runTakeActions(props, params.playerId);
          break;
        case Category.UPDATE:
          await this.runUpdateActions(props, params.playerId);
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
  private async runGiveActions(parameters: { [key: string]: any } | string, playerId: string, challengeId?: string) {
    const quantity: number = parameters[1] ? +parameters[1] : 1;
    if (parameters[0] !== 'points') {
      const reward: Reward = await this.rewardService.findById(parameters[0]);
      await this.playerRewardService.findOneAndUpdate(
        {
          player: playerId,
          reward: parameters[0],
        },
        { $inc: { count: quantity } },
        { upsert: true, setDefaultsOnInsert: true },
      );
      if (reward.kind === RewardType.REVEAL) await markAsAvailable(challengeId, playerId);
      else if (reward.kind === RewardType.UNLOCK) await markAsOpen(challengeId, playerId, new Date());
      else {
        //fire REWARD_GRANTED event
        await this.eventService.fireEvent(TriggerEvent.REWARD_GRANTED, {
          rewardId: parameters[0],
          playerId: playerId,
        });
      }
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: quantity } });
      //fire POINTS-UPDATED event
      await this.eventService.fireEvent(TriggerEvent.POINTS_UPDATED, {
        playerId: playerId,
      });
    }
  }

  /**
   * Runs actions with type "TAKE", parameters are string arrays with two strings inside.
   * Parameter is structured as ["rewardId/points_nr", quantity].
   * If quantity is not provided - default (1) is applied.
   * @param parameters - string array
   * @param playerId - id of the player
   */
  private async runTakeActions(parameters: { [key: string]: any } | string, playerId: string) {
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
  private async runUpdateActions(parameters: { [key: string]: any }, playerId: string) {
    if (parameters[0] === 'player') {
      await this.updatePlayer(parameters, playerId);
    } else {
      await this.updateChallengeState(parameters, playerId);
    }
  }

  /**
   * Updates the status of the challenge
   */
  private async updateChallengeState(param: { [key: string]: any }, playerId: string) {
    switch (param[3]) {
      case State.AVAILABLE:
        await markAsAvailable(param[2], playerId);
        break;
      case State.LOCKED:
        await markAsLocked(param[2], playerId);
        break;
      case State.HIDDEN:
        await markAsHidden(param[2], playerId);
        break;
      case State.OPENED:
        await markAsOpen(param[2], playerId, new Date());
        break;
      case State.FAILED:
        await markAsFailed(param[2], playerId, new Date());
        break;
      case State.COMPLETED:
        await markAsCompleted(param[2], playerId, new Date());
        break;
      case State.REJECTED:
        await markAsRejected(param[2], playerId);
        break;
    }
  }

  /**
   * Updates player properties.
   */
  private async updatePlayer(param: { [key: string]: any }, playerId: string) {
    switch (param[1]) {
      // more cases can be later added if needed
      case 'points':
        await this.updatePlayerPoints(param, playerId);
        break;
    }

    // fire PLAYER_UPDATED event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_UPDATED, {
      playerId: playerId,
    });
  }

  /**
   * Updates players points.
   */
  private async updatePlayerPoints(param: { [key: string]: any }, playerId: string) {
    if (param[2].startsWith('+')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: +param[2].substring(1) } });
    } else if (param[2].startsWith('-')) {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { $inc: { points: -param[2].substring(1) } });
    } else {
      await this.playerService.findOneAndUpdate({ _id: playerId }, { points: +param });
    }

    // fire POINTS_UPDATED event
    await this.eventService.fireEvent(TriggerEvent.POINTS_UPDATED, {
      playerId: playerId,
    });
  }
}
