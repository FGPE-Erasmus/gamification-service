import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { RewardModule } from '../reward/reward.module';
import { EventModule } from '../event/event.module';
import { SubmissionModule } from '../submission/submission.module';
import { ActionHookResolver } from './action-hook.resolver';
import { ActionHookService } from './action-hook.service';
import { HookService } from './hook.service';
import { ActionHookSchema } from './models/action-hook.model';
import { ScheduledHookSchema } from './models/scheduled-hook.model';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookResolver } from './scheduled-hook.resolver';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ActionHook',
        schema: ActionHookSchema,
      },
      {
        name: 'ScheduledHook',
        schema: ScheduledHookSchema,
      },
    ]),
    forwardRef(() => GameModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => RewardModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
    forwardRef(() => EventModule),
    forwardRef(() => SubscriptionsModule),
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
