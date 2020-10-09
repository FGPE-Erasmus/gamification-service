import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { checkCriteria } from '../../common/helpers/criteria.helper';
import { ActionEmbedDto } from '../../hook/dto/embedded/action.dto';
import { CategoryEnum as Category } from '../../hook/enums/category.enum';
import { ActionHook } from '../../hook/models/action-hook.model';
import { ScheduledHook } from '../../hook/models/scheduled-hook.model';
import { HookService } from '../../hook/hook.service';
import { Player } from '../../player/models/player.model';
import { RewardService } from '../../reward/reward.service';
import { SubmissionService } from '../../submission/submission.service';
import { PlayerService } from '../../player/player.service';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly hookService: HookService,
    private readonly playerService: PlayerService,
    private readonly rewardService: RewardService,
    private readonly submissionService: SubmissionService,
  ) {}

  @Process()
  async hookExecution(job: Job<unknown>): Promise<any> {
    let hook: ActionHook | ScheduledHook;
    if (typeof job.data['trigger'] !== undefined) {
      hook = job.data['hook'] as ActionHook;
    } else {
      hook = job.data['hook'] as ScheduledHook;
    }
    const meet = checkCriteria(hook.criteria, job.data['params'], {
      player: (id: string) => this.playerService.findById(id),
      submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }),
      players: () => this.playerService.findAll({ game: { $eq: hook.game } }),
    });
    if (meet) {
      // this.runActions(hook.actions, player);
    }
  }

  async runActions(actions: ActionEmbedDto[], player: Player): Promise<any> {
    actions.forEach(action => {
      // TODO: get a reward obj from its id located in action.parameters and pass it as the first argument in methods below
      switch (action.type) {
        case Category.GIVE:
          this.rewardService.grantReward(action.parameters, player);
          break;
        case Category.TAKE:
          //what other 'things' we can substract/take from the player? apart from points ofc
          this.rewardService.substractPoints(action.parameters, player);
          break;
        case Category.UPDATE:
          this.rewardService.updatePlayer(action.parameters, player);
          break;
      }
    });
  }
}
