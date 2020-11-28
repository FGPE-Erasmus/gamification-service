import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChallengeModule } from '../challenge/challenge.module';
import { PlayerModule } from '../player/player.module';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ChallengeStatusSchema } from './models/challenge-status.model';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusToDtoMapper } from './mappers/challenge-status-to-dto.mapper';
import { EventModule } from '../event/event.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'ChallengeStatus',
        schema: ChallengeStatusSchema,
      },
    ]),
    forwardRef(() => UsersModule),
    forwardRef(() => EventModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => ChallengeModule),
  ],
  providers: [ChallengeStatusToDtoMapper, ChallengeStatusRepository, ChallengeStatusService, ChallengeStatusResolver],
  exports: [ChallengeStatusToDtoMapper, ChallengeStatusService],
})
export class ChallengeStatusModule {}
