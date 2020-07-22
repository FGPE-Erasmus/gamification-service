import { ID, Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsMongoId } from 'class-validator';

import { CreateChallengeDto } from './create-challenge.dto';

@ArgsType()
export class UpsertChallengeDto {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field()
  challengeInput: CreateChallengeDto;
}
