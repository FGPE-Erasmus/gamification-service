import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { SubmissionResolver } from './submission.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubmissionRepository } from './submission.repository';

@Module({
  imports: [TypeOrmModule.forFeature([SubmissionRepository])],
  exports: [SubmissionService],
  providers: [SubmissionService, ServiceHelper, SubmissionResolver],
})
export class SubmissionModule {}
