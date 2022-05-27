import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EvaluationEngineService } from './evaluation-engine.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ActivityDto } from './dto/activity.dto';
import { Submission } from '../submission/models/submission.model';
import { Result } from '../submission/models/result.enum';
import { SubmissionService } from '../submission/submission.service';
import { ActivityStatusDto } from './dto/activity-status.dto';

@Injectable()
export class ActivityService {
  protected readonly logger: Logger;

  constructor(
    protected readonly evaluationEngineService: EvaluationEngineService,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    protected readonly submissionService: SubmissionService,
  ) {
    this.logger = new Logger(ActivityService.name);
  }

  public async getActivities(courseId: string, challengeId: string): Promise<ActivityDto[]> {
    const challenge = await this.challengeService.findById(challengeId, 'refs');
    if (challenge) {
      return this.evaluationEngineService.getActivities(courseId, challenge.refs);
    }
    throw new NotFoundException();
  }

  public async getActivity(courseId: string, activityId: string): Promise<ActivityDto> {
    return this.evaluationEngineService.getActivity(courseId, activityId);
  }

  public async getActivityStatus(gameId: string, activityId: string, playerId: string): Promise<ActivityStatusDto> {
    return {
      game: gameId,
      activity: activityId,
      solved: await this.isActivitySolved(gameId, activityId, playerId),
    } as ActivityStatusDto;
  }

  public async isActivitySolved(gameId: string, exerciseId: string, playerId: string): Promise<boolean> {
    const acceptedSubmission: Submission = await this.submissionService.findOne(
      {
        $and: [
          { game: { $eq: gameId } },
          { exerciseId: { $eq: exerciseId } },
          { player: { $eq: playerId } },
          { result: { $eq: Result.ACCEPT } },
        ],
      },
      'id',
    );
    return !!acceptedSubmission;
  }
}
