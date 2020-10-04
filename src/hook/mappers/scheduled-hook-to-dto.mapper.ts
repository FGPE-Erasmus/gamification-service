import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ScheduledHook } from '../models/scheduled-hook.model';
import { ScheduledHookDto } from '../dto/scheduled-hook.dto';

@Injectable()
export class ScheduledHookToDtoMapper implements IMapper<ScheduledHook, ScheduledHookDto> {

  async transform(obj: ScheduledHook): Promise<ScheduledHookDto> {
    return plainToClass(ScheduledHookDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
