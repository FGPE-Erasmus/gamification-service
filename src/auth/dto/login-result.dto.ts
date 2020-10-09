import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';

import { UserDto } from '../../users/dto/user.dto';

@ObjectType('LoginResult')
export default class LoginResultDto {
  @Field(() => Int)
  @Expose()
  expiresIn: number;

  @Field()
  @Expose()
  token: string;

  @Field(() => UserDto)
  @Expose()
  user: UserDto;
}
