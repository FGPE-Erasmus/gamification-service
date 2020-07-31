import { Module } from '@nestjs/common';
import { ChallengeService } from './challenge.service';
import { ServiceHelper } from '../common/helpers/service.helper';
import { ChallengeRepository } from './repositories/challenge.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeRepository])],
  providers: [ServiceHelper, ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
