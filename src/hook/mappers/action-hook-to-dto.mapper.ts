import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { pick } from '../../common/utils/object.utils';
import { ActionHookDto } from '../dto/action-hook.dto';
import { ActionHook } from '../models/action-hook.model';

@Injectable()
export class ActionHookToDtoMapper implements IMapper<ActionHook, ActionHookDto> {
  async transform(obj: ActionHook): Promise<ActionHookDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'parentChallenge',
        'sourceId',
        'trigger',
        'criteria',
        'actions',
        'recurrent',
        'active',
        'lastRun',
        'createdAt',
        'updatedAt',
      ],
      obj,
    );
  }
}
