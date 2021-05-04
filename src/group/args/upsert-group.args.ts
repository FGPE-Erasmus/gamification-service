import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsOptional, ValidateNested } from 'class-validator';

import { GroupInput } from '../inputs/group.input';

@ArgsType()
export class UpsertGroupArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  @ValidateNested()
  groupInput: GroupInput;
}
