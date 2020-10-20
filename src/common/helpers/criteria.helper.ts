import { JSONPath } from 'jsonpath-plus';

import { ComparingFunctionEnum as ComparingFunction } from '../../hook/enums/comparing-function.enum';
import { JunctorEnum as Junctor } from '../../hook/enums/junctor.enum';
import { CriteriaEmbed } from '../../hook/models/embedded/criteria.embed';
import { Submission } from '../../submission/models/submission.model';
import { Player } from '../../player/models/player.model';

export async function checkCriteria(
  criteria: CriteriaEmbed,
  params: { [key: string]: any },
  actionObj: { [key: string]: any },
  resolvers: {
    submissions: () => Promise<Submission[]>;
    players: () => Promise<Player[]>;
    player: (id: string) => Promise<Player>;
  },
): Promise<boolean> {
  let result = true;

  const conditions = [...criteria.conditions].sort((a, b) => (a.order > b.order ? 1 : -1));

  let i = 0;
  do {
    const condition = conditions[i];
    const leftSide = await inferCriteriaEntityValue(
      condition.leftEntity,
      condition.leftProperty,
      params,
      actionObj,
      resolvers,
    );
    let rightSide: any = null;
    if (![ComparingFunction.IS_EMPTY, ComparingFunction.NOT_EMPTY].includes(condition.comparingFunction)) {
      rightSide = await inferCriteriaEntityValue(
        condition.rightEntity,
        condition.rightProperty,
        params,
        actionObj,
        resolvers,
      );
    }
    const partial: boolean = evaluateCondition(leftSide, rightSide, condition.comparingFunction);
    if (i === 0 || criteria.junctors[i - 1] === Junctor.AND) {
      result = result && partial;
    } else {
      result = result || partial;
    }
  } while (i++ < criteria.conditions.length);

  return result;
}

export async function inferCriteriaEntityValue(
  identity: string,
  property: string,
  params: { [key: string]: any },
  actionObj: { [key: string]: any },
  resolvers: {
    submissions: () => Promise<Submission[]>;
    players: () => Promise<Player[]>;
    player: (id: string) => Promise<Player>;
  },
): Promise<any> {
  switch (identity) {
    case 'FIXED': //value of the property is already the value to check
      return property;

    case 'EVENT': //JSON object with all event parameters
      const event = {
        ...params,
        player: resolvers.player(params.playerId),
      };
      return JSONPath({ path: property, json: event });

    case 'PLAYER': //property is the JSONPath to be applied to the player inside the trigger
      return JSONPath({ path: property, json: resolvers.player(params.playerId) });

    case 'ENVIRONMENT': //JSON object with current time, submissions, and players
      let environment;
      if (property.startsWith('$.submissions')) {
        environment = {
          submissions: resolvers.submissions(),
        };
      } else if (property.startsWith('$.players')) {
        environment = {
          players: resolvers.players(),
        };
      } else {
        environment = {
          current_time: new Date(),
        };
      }
      return JSONPath({ path: property, json: environment });
  }
}

export function evaluateCondition(left: any | any[], right: any | any[], comparingFunction: string): boolean {
  switch (comparingFunction) {
    case ComparingFunction.LESS_THAN:
      return left < right;
    case ComparingFunction.GREATER_THAN:
      return left > right;
    case ComparingFunction.LESS_OR_EQUAL:
      return left <= right;
    case ComparingFunction.GREAT_OR_EQUAL:
      return left >= right;
    case ComparingFunction.EQUAL:
      return left === right;
    case ComparingFunction.NOT_EQUAL:
      return left !== right;
    case ComparingFunction.STARTS_WITH:
      return left.startsWith(right);
    case ComparingFunction.MATCHES:
      return left.match(right);
    case ComparingFunction.NOT_MATCHES:
      return !left.match(right);
    case ComparingFunction.IS_EMPTY:
      return left.length === 0 || left.includes('');
    case ComparingFunction.NOT_EMPTY:
      return left.length !== 0 && !left.includes('');
    case ComparingFunction.IN:
      return [...right].includes(left);
    case ComparingFunction.NOT_IN:
      return ![...right].includes(left);
  }
}
