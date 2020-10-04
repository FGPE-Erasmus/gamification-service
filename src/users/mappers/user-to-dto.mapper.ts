import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { UserDto } from '../dto/user.dto';
import { User } from '../models/user.model';

@Injectable()
export class UserToDtoMapper implements IMapper<User, UserDto> {

  async transform(obj: User): Promise<UserDto> {
    return plainToClass(UserDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
