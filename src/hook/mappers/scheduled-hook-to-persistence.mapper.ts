import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ScheduledHookInput } from '../inputs/scheduled-hook.input';
import { ScheduledHook } from '../models/scheduled-hook.model';

@Injectable()
export class ScheduledHookToPersistenceMapper implements IMapper<ScheduledHookInput | Partial<ScheduledHookInput>, ScheduledHook | Partial<ScheduledHook>> {

  async transform(obj: ScheduledHookInput | Partial<ScheduledHookInput>): Promise<ScheduledHook | Partial<ScheduledHook>> {
    return plainToClass(ScheduledHook, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
