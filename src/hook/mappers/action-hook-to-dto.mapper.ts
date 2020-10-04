import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { ActionHookDto } from '../dto/action-hook.dto';
import { ActionHook } from '../models/action-hook.model';

@Injectable()
export class ActionHookToDtoMapper implements IMapper<ActionHook, ActionHookDto> {

  async transform(obj: ActionHook): Promise<ActionHookDto> {
    return plainToClass(ActionHookDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
