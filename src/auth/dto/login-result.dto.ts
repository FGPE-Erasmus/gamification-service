import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UserEntity as User } from '../../users/entities/user.entity';

@ObjectType('LoginResult')
export default class LoginResultDto {
  @Field(() => Int)
  expiresIn: number;

  @Field()
  token: string;

  @Field(() => User)
  user: User;
}
