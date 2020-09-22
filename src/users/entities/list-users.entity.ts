import { ObjectType, Field, Int } from '@nestjs/graphql';

import { IPagination } from '../../common/interfaces/pagination.interface';
import { UserEntity as User } from './user.entity';

@ObjectType('ListUsers')
export class ListUsersEntity implements IPagination<User> {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
