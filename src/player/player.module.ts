import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { GameModule } from '../game/game.module';
import { GroupModule } from '../group/group.module';
import { EventModule } from '../event/event.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { PlayerService } from './player.service';
import { PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerResolver } from './player.resolver';
import { NotificationModule } from '../notifications/notification.module';
import { PlayerStatsResolver } from './player-stats.resolver';
import { StatsResolver } from './stats.resolver';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Player',
        schema: PlayerSchema,
      },
    ]),
    CacheModule,
    forwardRef(() => EventModule),
    forwardRef(() => GameModule),
    forwardRef(() => GroupModule),
    forwardRef(() => ChallengeStatusModule),
    forwardRef(() => PlayerRewardModule),
    forwardRef(() => SubmissionModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => NotificationModule),
  ],
  providers: [PlayerToDtoMapper, PlayerRepository, PlayerService, PlayerResolver, PlayerStatsResolver, StatsResolver],
  exports: [PlayerToDtoMapper, PlayerRepository, PlayerService],
})
export class PlayerModule {}
