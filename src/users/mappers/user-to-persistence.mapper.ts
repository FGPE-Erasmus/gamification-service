import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { User } from '../models/user.model';
import { UserInput } from '../inputs/user.input';

@Injectable()
export class UserToPersistenceMapper implements IMapper<UserInput, User> {
  async transform(obj: UserInput): Promise<User> {
    if (!obj) {
      return undefined;
    }
    return {
      username: obj.username,
      email: obj.email,
      password: obj.password,
      name: obj.name,
      birthDate: obj.birthDate,
      photo: obj.photo,
      telephone: obj.telephone,
      roles: obj.roles,
      active: obj.active,
    } as User;
  }
}
