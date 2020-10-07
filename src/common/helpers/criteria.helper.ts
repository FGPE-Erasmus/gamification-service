import { JSONPath } from 'jsonpath-plus';

import { ActionHookDto } from 'src/hook/dto/action-hook.dto';
import { ScheduledHookDto } from 'src/hook/dto/scheduled-hook.dto';
import { ConditionEmbed } from 'src/hook/entities/embedded/condition.embed';
import { CriteriaEmbed } from 'src/hook/entities/embedded/criteria.embed';
import { ComparingFunctionEnum } from 'src/hook/enum/comparing-function.enum';
import { JunctorEnum } from 'src/hook/enum/junctor.enum';
import { PlayerService } from 'src/player/player.service';
import { SubmissionService } from 'src/submission/submission.service';

export class CriteriaHelper {
  constructor(private playerService: PlayerService, private submissionService: SubmissionService) {}
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
        return left.match(right);
      case ComparingFunctionEnum.NOT_MATCHES:
        return !left.match(right);
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
}
