import { ID, Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsMongoId, ValidateNested } from 'class-validator';

import { UserInput } from '../inputs/user.input';

@ArgsType()
export class UpsertUserArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @ValidateNested()
  userInput: UserInput;
}
