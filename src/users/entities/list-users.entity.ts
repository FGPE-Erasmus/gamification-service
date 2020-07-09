import { ObjectType, Field, Int } from '@nestjs/graphql';

import { IListItems } from '../../common/interfaces/list-items.interface';
import { UserEntity as User } from './user.entity';

@ObjectType('ListUsers')
export class ListUsersEntity implements IListItems {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
