import { Injectable } from '@nestjs/common';

import { extractToJson } from '../common/utils/extraction.utils';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { GameEntity as Game } from '../game/entities/game.entity';
import { TriggerKindEnum as TriggerKind } from './enum/trigger-kind.enum';
import { ScheduledHookService } from './scheduled-hook.service';
import { ActionHookService } from './action-hook.service';
import { ActionHookDto } from './dto/action-hook.dto';
import { ScheduledHookDto } from './dto/scheduled-hook.dto';
import { ScheduledHookInput } from './input/scheduled-hook.input';
import { ActionHookInput } from './input/action-hook.input';
import { ConditionInput } from './input/condition.input';

@Injectable()
export class HookService {
  constructor(
    private readonly scheduledHookService: ScheduledHookService,
    private readonly actionHookService: ActionHookService,
  ) {}

  async importGEdIL(
    game: Game,
    entries: { [path: string]: Buffer },
    parentChallenge?: Challenge,
  ): Promise<(ScheduledHookDto | ActionHookDto)[] | undefined> {
    const hooks: (ScheduledHookDto | ActionHookDto)[] = [];

    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);

      const triggers = encodedContent.triggers;
      for (const trigger of triggers) {
        let hook: ScheduledHookDto | ActionHookDto;

        const data: { [key: string]: any } = {
          game: game.id?.toString(),
          parentChallenge: parentChallenge?.id?.toString(),
          criteria: {
            ...encodedContent.criteria,
            conditions: this.transformConditions(encodedContent.criteria.conditions),
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
          } as ActionHookInput);
        } else if (trigger.kind === TriggerKind.SCHEDULED) {
          if (trigger.event === 'INTERVAL') {
            data.interval = parseInt(trigger.parameters[0]);
          } else {
            data.cron = trigger.parameters[0];
          }
          hook = await this.scheduledHookService.create({
            ...data,
          } as ScheduledHookInput);
        }
        hooks.push(hook);
      }
    }

    return hooks;
  }

  /**
   * Find all hooks.
   *
   * @returns {Promise<(ActionHookDto | ScheduledHookDto)[]>} the hooks.
   */
  async findAll(): Promise<(ActionHookDto | ScheduledHookDto)[]> {
    return [...(await this.actionHookService.findAll()), ...(await this.scheduledHookService.findAll())];
  }

  /**
   * Finds an hook by its ID.
   *
   * @param {string} id of the hook
   * @returns {(Promise<ActionHookDto | ScheduledHookDto | undefined>)}
   * @memberof ChallengeService
   */
  async findOne(id: string): Promise<ActionHookDto | ScheduledHookDto | undefined> {
    let hook: ActionHookDto | ScheduledHookDto = await this.actionHookService.findOne(id);
    if (!hook) {
      hook = await this.scheduledHookService.findOne(id);
    }
    return hook;
  }

  /** Helpers */

  private transformConditions(data: [{ [key: string]: any }]): ConditionInput[] {
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
