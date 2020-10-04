import { Injectable } from '@nestjs/common';
import { classToPlain, plainToClass } from 'class-transformer';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { User } from '../models/user.model';
import { UserInput } from '../inputs/user.input';

@Injectable()
export class UserToPersistenceMapper implements IMapper<UserInput, User> {

  async transform(obj: UserInput): Promise<User> {
    return plainToClass(User, classToPlain(obj, { excludeExtraneousValues: true }));
  }
}
