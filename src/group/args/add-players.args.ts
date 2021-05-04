import { ArgsType, Field, ID } from '@nestjs/graphql';
import { IsMongoId, IsOptional } from 'class-validator';

@ArgsType()
export class AddPlayersArgs {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsMongoId()
  id?: string;

  @Field(() => [String])
  @IsMongoId({ each: true })
  players: string[];
}
