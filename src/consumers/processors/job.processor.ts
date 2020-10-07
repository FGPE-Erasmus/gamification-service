import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { CategoryEnum as Category } from '../../hook/enum/category.enum';
import { HookService } from '../../hook/hook.service';
import { Action } from '../../hook/dto/action.dto';
import { PlayerEntity as Player } from '../../player/entities/player.entity';
import { RewardService } from '../../reward/reward.service';
import { SubmissionService } from 'src/submission/submission.service';
import { PlayerService } from 'src/player/player.service';
import { ActionHookDto } from 'src/hook/dto/action-hook.dto';
import { ScheduledHookDto } from 'src/hook/dto/scheduled-hook.dto';
import { CriteriaHelper } from 'src/common/helpers/criteria.helper';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly hookService: HookService,
    private readonly rewardService: RewardService,
    private readonly submissionService: SubmissionService,
    private readonly playerService: PlayerService,
    private readonly criteriaHelper: CriteriaHelper,
  ) {}

  @Process()
  async hookExecution(job: Job<unknown>): Promise<any> {
    let hook: ActionHookDto | ScheduledHookDto;
    if (typeof job.data['trigger'] !== undefined) {
      hook = job.data['hook'] as ActionHookDto;
    } else {
      hook = job.data['hook'] as ScheduledHookDto;
    }
    if (this.criteriaHelper.checkCriteria(hook, job.data['params'])) {
      // this.runActions(hook.actions, player);
    }
  }

  async runActions(actions: Action[], player: Player): Promise<any> {
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
