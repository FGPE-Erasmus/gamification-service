import { Processor, Process } from '@nestjs/bull';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';
import { Category } from 'src/hook/enums/category.enum';
import { Job } from 'bull';
import { Criteria } from 'src/hook/other-dto/criteria.dto';
import { Junctor } from 'src/hook/enums/junctor.enum';
import { Action } from 'src/hook/other-dto/action.dto';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { RewardService } from 'src/reward/reward.service';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly actionHookRepository: ActionHookRepository,
    private readonly rewardService: RewardService,
  ) {}

  @Process()
  async performActionOnCompleted(job: Job<unknown>): Promise<any> {
    const hooks = await this.actionHookRepository.find({
      where: {
        gameId: job.data['gameId'],
        trigger: job.name,
      },
    });
    hooks.forEach(hook => {
      if (this.checkCriteria(hook.criteria)) {
        this.runActions(hook.actions, job.data['player'] as Player);
      }
    });
  }

  //to be changed
  checkCriteria(criterias: Criteria[]): boolean {
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
