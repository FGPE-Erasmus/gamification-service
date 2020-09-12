import { ScheduledHookEntity as ScheduledHook } from './entities/scheduled-hook.entity';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';
import { ActionHookRepository } from './repository/action-hook.repository';
import { HookEntity as Hook } from './entities/hook.entity';
import { ActionHookEntity as ActionHook } from './entities/action-hook.entity';
import { Injectable } from '@nestjs/common';
import { Trigger } from './enums/trigger.enum';

@Injectable()
export class HookService {
  constructor(
    private readonly scheduledHookRepository: ScheduledHookRepository,
    private readonly actionHookRepository: ActionHookRepository,
  ) {}

  async registerScheduledHook(
    hook: Hook,
    recurrent: boolean,
    trigger: string,
    nextRun: Date,
    lastRun: Date,
  ): Promise<ScheduledHook> {
    const scheduledHook = {
      ...hook,
      recurrent: recurrent,
      trigger: trigger,
      nextRun: nextRun,
      lastRun: lastRun,
    } as ScheduledHook;
    delete scheduledHook['id'];
    return await this.scheduledHookRepository.save(scheduledHook);
  }

  async registerActionHook(hook: Hook, trigger: Trigger, sourceId: string, lastRun: Date): Promise<ActionHook> {
    const actionHook = {
      ...hook,
      trigger: trigger,
      sourceId: sourceId,
      lastRun: lastRun,
    } as ActionHook;
    delete actionHook['id'];
    return await this.actionHookRepository.save(actionHook);
  }
}
