import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

import { CategoryEnum as Category } from '../../hook/enums/category.enum';
import { HookService } from '../../hook/hook.service';
import { CriteriaEmbedDto } from '../../hook/dto/embedded/criteria.dto';
import { ActionEmbedDto } from '../../hook/dto/embedded/action.dto';
import { Player } from '../../player/models/player.model';
import { RewardService } from '../../reward/reward.service';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(private readonly hookService: HookService, private readonly rewardService: RewardService) {}

  @Process()
  async performActionOnCompleted(job: Job<unknown>): Promise<any> {
    /* const hooks = await this.hookService.find({
      where: {
        gameId: job.data['gameId'],
        trigger: job.name,
      },
    });
    hooks.forEach(hook => {
      if (this.checkCriteria(hook.criteria)) {
        this.runActions(hook.actions, job.data['player'] as Player);
      }
    }); */
  }

  //to be changed
  checkCriteria(criterias: CriteriaEmbedDto[]): boolean {
    // criterias.some(criteria => {
    //   const conditional = '';
    //   const junctorsLength = criteria.junctors.length;
    //   for (let i = 0; i < junctorsLength; i++) {
    //     const junctor = criteria.junctors[i] === Junctor.AND ? '&&' : '||';
    //     conditional.concat(criteria.conditions[i] + ' ' + junctor + ' ');
    //   }
    //   conditional.concat(criteria.conditions[junctorsLength]);
    // if (!eval(conditional)) return false;
    // });
    return true;
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
