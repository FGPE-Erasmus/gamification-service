import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { CategoryEnum as Category } from '../../hook/enums/category.enum';
import { HookService } from '../../hook/hook.service';
import { CriteriaEmbedDto } from '../../hook/dto/embedded/criteria.dto';
import { ActionEmbedDto } from '../../hook/dto/embedded/action.dto';
import { Player } from '../../player/models/player.model';
import { RewardService } from '../../reward/reward.service';
import { SubmissionService } from 'src/submission/submission.service';
import { PlayerService } from 'src/player/player.service';
import { ActionHookDto } from 'src/hook/dto/action-hook.dto';
import { ScheduledHookDto } from 'src/hook/dto/scheduled-hook.dto';
import { CriteriaHelper } from 'src/common/helpers/criteria.helper';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { SubmissionRepository } from 'src/submission/repository/submission.repository';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly hookService: HookService,
    private readonly rewardService: RewardService,
    private readonly criteriaHelper: CriteriaHelper,
    private readonly submissionRepository: SubmissionRepository,
    private readonly playerRepository: PlayerRepository,
  ) {
    this.criteriaHelper = new CriteriaHelper(this.playerRepository, this.submissionRepository);
  }

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
