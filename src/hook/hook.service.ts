import { Injectable } from '@nestjs/common';

import { ScheduledHookEntity as ScheduledHook } from './entities/scheduled-hook.entity';
import { ActionHookEntity as ActionHook } from './entities/action-hook.entity';
import { GameEntity as Game } from 'src/game/entities/game.entity';
import { HookDto } from './other-dto/hook.dto';
import { Trigger } from './other-dto/trigger.dto';
import { TriggerKind } from './enums/trigger-kind.dto';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';
import { ActionHookRepository } from './repository/action-hook.repository';
import { extractToJson } from 'src/common/utils/extraction.utils';

@Injectable()
export class HookService {
  constructor(
    private readonly scheduledHookRepository: ScheduledHookRepository,
    private readonly actionHookRepository: ActionHookRepository,
  ) {}

  async importGEdIL(game: Game, entries: { [path: string]: Buffer }): Promise<ScheduledHook | ActionHook | undefined> {
    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      const triggers: Trigger[] = encodedContent.triggers;
      delete encodedContent.triggers;

      triggers.forEach(singleTrigger => {
        if (singleTrigger.kind === TriggerKind.ACTION) {
          encodedContent.trigger = singleTrigger;
          this.registerActionHook({
            ...encodedContent,
            gameId: game.id,
          });
        } else if (singleTrigger.kind === TriggerKind.SCHEDULED) {
          encodedContent.trigger = singleTrigger;
          this.registerScheduledHook({
            ...encodedContent,
            gameId: game.id,
          });
        }
      });
    }
    return;
  }

  async registerScheduledHook(hook: HookDto): Promise<ScheduledHook> {
    return await this.scheduledHookRepository.save(hook);
  }

  async registerActionHook(hook: HookDto): Promise<ActionHook> {
    return await this.actionHookRepository.save(hook);
  }
}
