import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ActionHookInput } from '../inputs/action-hook.input';
import { ActionHook } from '../models/action-hook.model';

@Injectable()
export class ActionHookToPersistenceMapper
  implements IMapper<ActionHookInput | Partial<ActionHookInput>, ActionHook | Partial<ActionHook>> {
  async transform(obj: ActionHookInput | Partial<ActionHookInput>): Promise<ActionHook | Partial<ActionHook>> {
    if (!obj) {
      return undefined;
    }
    return plainToClass(ActionHook, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
