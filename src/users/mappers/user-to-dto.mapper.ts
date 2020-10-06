import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { UserDto } from '../dto/user.dto';
import { User } from '../models/user.model';

@Injectable()
export class UserToDtoMapper implements IMapper<User, UserDto> {
  async transform(obj: User): Promise<UserDto> {
    if (!obj) {
      return undefined;
    }
    return {
      id: obj._id,
      username: obj.username,
      email: obj.email,
      password: obj.password,
      name: obj.name,
      birthDate: obj.birthDate,
      photo: obj.photo,
      telephone: obj.telephone,
      roles: obj.roles,
      active: obj.active,
      registrations: obj.registrations,
      createdAt: obj['createdAt'],
      updatedAt: obj['updatedAt'],
    };
  }
}
