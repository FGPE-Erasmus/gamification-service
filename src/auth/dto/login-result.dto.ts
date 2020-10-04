import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UserDto } from '../../users/dto/user.dto';

@ObjectType('LoginResult')
export default class LoginResultDto {
  @Field(() => Int)
  expiresIn: number;

  @Field()
  token: string;

  @Field(() => UserDto)
  user: UserDto;
}
