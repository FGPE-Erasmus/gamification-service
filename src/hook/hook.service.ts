import { HookRepository } from './repository/hook.repository';
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
    private readonly hookRepository: HookRepository,
    private readonly scheduledHookRepository: ScheduledHookRepository,
    private readonly actionHookRepository: ActionHookRepository,
  ) {}

  async uploadHook(hook: Hook): Promise<Hook> {
    return await this.hookRepository.save(hook);
  }

  async uploadScheduledHook(
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
    return await this.scheduledHookRepository.save(scheduledHook);
  }

  async uploadActionHook(hook: Hook, trigger: Trigger, sourceId: string, lastRun: Date): Promise<ActionHook> {
    const actionHook = {
      ...hook,
      trigger: trigger,
      sourceId: sourceId,
      lastRun: lastRun,
    } as ActionHook;
    return await this.actionHookRepository.save(actionHook);
  }
}
