import { Module } from '@nestjs/common';
import { ChallengeStatusService } from './challenge-status.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeStatusRepository } from './repositories/challenge-status.repository';
import { ChallengeStatusResolver } from './challenge-status.resolver';
import { ServiceHelper } from '../common/helpers/service.helper';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeStatusRepository])],
  providers: [ChallengeStatusService, ServiceHelper, ChallengeStatusResolver],
  exports: [ChallengeStatusService],
})
export class ChallengeStatusModule {}
