import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { GameModule } from '../game/game.module';
import { ActionHookResolver } from './action-hook.resolver';
import { ActionHookService } from './action-hook.service';
import { HookService } from './hook.service';
import { ActionHook, ActionHookSchema } from './models/action-hook.model';
import { ScheduledHook, ScheduledHookSchema } from './models/scheduled-hook.model';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookResolver } from './scheduled-hook.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ActionHook.name,
        schema: ActionHookSchema,
      },
      {
        name: ScheduledHook.name,
        schema: ScheduledHookSchema,
      },
    ]),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
  ],
  providers: [
    ActionHookToDtoMapper,
    ScheduledHookToDtoMapper,
    ActionHookRepository,
    ScheduledHookRepository,
    HookService,
    ActionHookService,
    ScheduledHookService,
    ActionHookResolver,
    ScheduledHookResolver,
  ],
  exports: [HookService, ActionHookService, ScheduledHookService],
})
export class HookModule {}
