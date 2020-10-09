import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ScheduledHook } from '../models/scheduled-hook.model';
import { ScheduledHookDto } from '../dto/scheduled-hook.dto';
import { pick } from '../../common/utils/object.utils';

@Injectable()
export class ScheduledHookToDtoMapper implements IMapper<ScheduledHook, ScheduledHookDto> {
  async transform(obj: ScheduledHook): Promise<ScheduledHookDto> {
    if (!obj) {
      return undefined;
    }
    return pick(
      [
        'id',
        'game',
        'parentChallenge',
        'cron',
        'interval',
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
