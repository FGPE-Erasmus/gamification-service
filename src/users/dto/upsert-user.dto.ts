import { ID, Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsMongoId } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

@ArgsType()
export class UpsertUserDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  userInput: CreateUserDto;
}
