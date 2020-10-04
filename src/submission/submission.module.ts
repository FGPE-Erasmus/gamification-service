import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PlayerModule } from '../player/player.module';
import { SubmissionService } from './submission.service';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionRepository } from './repository/submission.repository';
import { Submission, SubmissionSchema } from './models/submission.model';


@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Submission.name,
        useFactory: () => SubmissionSchema
      }
    ]),
    PlayerModule,
  ],
  providers: [SubmissionRepository, SubmissionService, SubmissionResolver],
  exports: [SubmissionService],
})
export class SubmissionModule {}
