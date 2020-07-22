import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeStatusService } from './challenge-status.service';
import { ChallengeStatusResolver } from './challenge-status.resolver';

@Module({
  providers: [ChallengeStatusService, ChallengeStatusResolver],
  exports: [ChallengeStatusService],
})
export class ChallengeStatusModule {}
