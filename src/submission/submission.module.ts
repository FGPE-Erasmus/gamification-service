import { Module } from '@nestjs/common';
import { SubmissionService } from './submission.service';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { SubmissionResolver } from './submission.resolver';

@Module({
  imports: [],
  exports: [SubmissionService],
  providers: [SubmissionService, ServiceHelper, SubmissionResolver],
})
export class SubmissionModule {}
