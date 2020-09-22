import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';

import { GameModule } from '../game/game.module';
import { ActionHookService } from './action-hook.service';
import { HookService } from './hook.service';
import { ActionHookRepository } from './repository/action-hook.repository';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookResolver } from './scheduled-hook.resolver';
import { ChallengeModule } from 'src/challenge/challenge.module';
import { ActionHookResolver } from './action-hook.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([ActionHookRepository, ScheduledHookRepository]),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
  ],
  providers: [HookService, ActionHookService, ScheduledHookService, ActionHookResolver, ScheduledHookResolver],
  exports: [HookService, ActionHookService, ScheduledHookService],
})
export class HookModule {}
