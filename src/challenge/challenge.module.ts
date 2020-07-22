import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeService } from './challenge.service';
import { ChallengesResolver } from './challenge.resolver';
import { ServiceHelper } from 'src/common/helpers/service.helper';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeRepository])],
  providers: [ServiceHelper, ChallengeService, ChallengesResolver],
  exports: [ChallengeService],
})
export class ChallengeModule {}
