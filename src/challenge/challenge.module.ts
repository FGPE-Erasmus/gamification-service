import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceHelper } from '../common/helpers/service.helper';

import { ChallengeService } from './challenge.service';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeResolver } from './challenge.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([ChallengeRepository])],
  providers: [ServiceHelper, ChallengeResolver, ChallengeService],
  exports: [ChallengeService],
})
export class ChallengeModule {}
