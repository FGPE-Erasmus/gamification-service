import { checkCriteria } from '../common/helpers/criteria.helper';
import { ActionHook } from '../hook/models/action-hook.model';
import { ScheduledHook } from '../hook/models/scheduled-hook.model';
import { PlayerService } from '../player/player.service';
import { RewardService } from '../reward/reward.service';
import { SubmissionService } from '../submission/submission.service';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { EventService } from './event.service';
import { runActions } from '../common/helpers/actions.helper';

export class EventProcessor {
  constructor(
    protected readonly playerService: PlayerService,
    protected readonly rewardService: RewardService,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly submissionService: SubmissionService,
    protected readonly eventService: EventService,
  ) {}

  async executeHook(
    hook: ActionHook | ScheduledHook,
    actionObj: { [key: string]: any },
    eventParams: { [key: string]: any },
  ): Promise<any> {
    const meet = checkCriteria(hook.criteria, eventParams, actionObj, {
      player: (id: string) => this.playerService.findById(id),
      submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }),
      players: () => this.playerService.findAll({ game: { $eq: hook.game } }),
    });
    if (meet) {
      runActions(hook.actions, eventParams, {
        playerReward: this.playerRewardService,
        reward: this.rewardService,
        player: this.playerService,
        event: this.eventService,
      });
    }
  }
}
