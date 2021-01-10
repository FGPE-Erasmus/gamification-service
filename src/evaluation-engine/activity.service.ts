import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EvaluationEngineService } from './evaluation-engine.service';
import { ChallengeService } from '../challenge/challenge.service';
import { ActivityDto } from './dto/activity.dto';

@Injectable()
export class ActivityService {
  protected readonly logger: Logger;

  constructor(
    protected readonly evaluationEngineService: EvaluationEngineService,
    protected readonly challengeService: ChallengeService,
  ) {
    this.logger = new Logger(ActivityService.name);
  }

  public async getActivities(gameId: string, challengeId: string): Promise<ActivityDto[]> {
    const challenge = await this.challengeService.findById(challengeId, 'refs');
    if (challenge) {
      return this.evaluationEngineService.getActivities(gameId, challenge.refs);
    }
    throw new NotFoundException();
  }

  public async getActivity(gameId: string, activityId: string): Promise<ActivityDto> {
    return this.evaluationEngineService.getActivity(gameId, activityId);
  }
}
