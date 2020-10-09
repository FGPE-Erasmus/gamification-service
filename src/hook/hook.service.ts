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

@Injectable()
export class HookService {
  constructor(
    protected readonly actionHookService: ActionHookService,
    protected readonly scheduledHookService: ScheduledHookService,
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
}
