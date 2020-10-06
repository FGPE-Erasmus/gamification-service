import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { JSONPath } from 'jsonpath-plus';

import { CategoryEnum as Category } from '../../hook/enum/category.enum';
import { HookService } from '../../hook/hook.service';
import { Action } from '../../hook/dto/action.dto';
import { PlayerEntity as Player } from '../../player/entities/player.entity';
import { RewardService } from '../../reward/reward.service';
import { ConditionEmbed } from 'src/hook/entities/embedded/condition.embed';
import { CriteriaEmbed } from 'src/hook/entities/embedded/criteria.embed';
import { JunctorEnum } from 'src/hook/enum/junctor.enum';
import { ComparingFunctionEnum } from 'src/hook/enum/comparing-function.enum';
import { SubmissionService } from 'src/submission/submission.service';
import { PlayerService } from 'src/player/player.service';
import { ActionHookDto } from 'src/hook/dto/action-hook.dto';
import { ScheduledHookDto } from 'src/hook/dto/scheduled-hook.dto';

@Processor('hooksQueue')
export class JobProcessor {
  constructor(
    private readonly hookService: HookService,
    private readonly rewardService: RewardService,
    private readonly submissionService: SubmissionService,
    private readonly playerService: PlayerService,
  ) {}

  @Process()
  async hookExecution(job: Job<unknown>): Promise<any> {
    let hook: ActionHookDto | ScheduledHookDto;
    if (typeof job.data['trigger'] !== undefined) {
      hook = job.data['hook'] as ActionHookDto;
    } else {
      hook = job.data['hook'] as ScheduledHookDto;
    }
    if (this.checkCriteria(hook, job.data['params'])) {
      // this.runActions(hook.actions, player);
    }
  }

  checkCriteria(hook: ActionHookDto | ScheduledHookDto, params: any): boolean {
    const criterias: CriteriaEmbed = hook.criteria;
    criterias.conditions.sort((a, b) => (a.order > b.order ? 1 : -1));
    let conditional = this.buildCriteria(criterias.conditions[0], hook.game, params);
    let i = 1;
    while (i !== criterias.junctors.length) {
      if (!conditional) break;
      if (criterias.junctors[i] === JunctorEnum.AND) {
        conditional = conditional && this.buildCriteria(criterias.conditions[i], hook.game, params);
      } else {
        conditional = conditional || this.buildCriteria(criterias.conditions[i], hook.game, params);
      }
      i++;
    }
    return conditional;
  }

  buildCriteria(condition: ConditionEmbed, gameId: string, params: any): boolean {
    const leftEntity = this.detectIdentity(condition.leftEntity, condition.leftProperty, gameId, params);
    const rightEntity = this.detectIdentity(condition.rightEntity, condition.rightProperty, gameId, params);
    return this.validate(leftEntity, rightEntity, condition.comparingFunction);
  }

  async detectIdentity(
    identity: string,
    property: string,
    gameId: string,
    params: any,
  ): Promise<{ [key: string]: any } | string> {
    const player = await this.playerService.getPlayer(params.PLAYER_ID);
    switch (identity) {
      case 'FIXED': //value of the property is already the value to check
        return property;

      case 'EVENT': //JSON object with all event parameters
        const event = {
          ...params,
          player,
        };
        return JSONPath({ path: property, json: event });

      case 'PLAYER': //property is the JSONPath to be applied to the player inside the trigger
        return JSONPath({ path: property, json: player });

      case 'ENVIRONMENT': //JSON object with current time, submissions, and players
        let environment;
        if (property.includes('submissions')) {
          environment = {
            submissions: await this.submissionService.getAllSubmissions(gameId),
          };
        } else if (property.includes('players')) {
          environment = {
            players: await this.playerService.getGamePlayers(gameId),
          };
        } else {
          environment = {
            current_time: new Date(),
          };
        }
        return JSONPath({ path: property, json: environment });
    }
  }

  validate(left: any | any[], right: any | any[], comparingFunction: string): boolean {
    switch (comparingFunction) {
      case ComparingFunctionEnum.LESS_THAN:
        return left < right;
      case ComparingFunctionEnum.GREATER_THAN:
        return left > right;
      case ComparingFunctionEnum.LESS_OR_EQUAL:
        return left <= right;
      case ComparingFunctionEnum.GREAT_OR_EQUAL:
        return left >= right;
      case ComparingFunctionEnum.EQUAL:
        return left === right;
      case ComparingFunctionEnum.NOT_EQUAL:
        return left !== right;
      case ComparingFunctionEnum.STARTS_WITH:
        return left.startsWith(right);
      case ComparingFunctionEnum.MATCHES:
        if (!left.match(right).includes('')) return true;
        else return false;
      case ComparingFunctionEnum.NOT_MATCHES:
        if (left.match(right).includes('')) return true;
        else return false;
      case ComparingFunctionEnum.IS_EMPTY:
        return left.length === 0 || left.includes('');
      case ComparingFunctionEnum.NOT_EMPTY:
        return left.length !== 0 && !left.includes('');
      case ComparingFunctionEnum.IN:
        return [...right].includes(left);
      case ComparingFunctionEnum.NOT_IN:
        return ![...right].includes(left);
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
