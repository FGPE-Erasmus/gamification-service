import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { UserEntity as User } from '../../users/entities/user.entity';
import { SubmissionService } from 'src/submission/submission.service';
import { SubmissionEntity as Submission } from 'src/submission/entity/submission.entity';

/**
 * Check if the user either owns the submission or is an admin.
 */
@Injectable()
export class GqlSubmissionAuthGuard implements CanActivate {
  constructor(private submissionService: SubmissionService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (request.user) {
      const user = request.user as User;
      const submission = request.submission as Submission;
      if (this.submissionService.isAuthorized(user, submission.playerId)) {
        return true;
      }
      throw new Error('User does not have permissions');
    }
    throw new Error('User is not logged in');
  }
}
