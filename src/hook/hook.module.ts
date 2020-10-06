import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameModule } from '../game/game.module';
import { ActionHookService } from './action-hook.service';
import { HookService } from './hook.service';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookResolver } from './scheduled-hook.resolver';
import { ChallengeModule } from '../challenge/challenge.module';
import { ActionHookResolver } from './action-hook.resolver';
import { ActionHook, ActionHookSchema } from './models/action-hook.model';
import { ScheduledHook, ScheduledHookSchema } from './models/scheduled-hook.model';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ActionHookToPersistenceMapper } from './mappers/action-hook-to-persistence.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';
import { ScheduledHookToPersistenceMapper } from './mappers/scheduled-hook-to-persistence.mapper';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';

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
    ActionHookToPersistenceMapper,
    ScheduledHookToDtoMapper,
    ScheduledHookToPersistenceMapper,
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
