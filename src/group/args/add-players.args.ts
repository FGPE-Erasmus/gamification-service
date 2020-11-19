import { ID, Field, ArgsType } from '@nestjs/graphql';
import { IsOptional, IsMongoId } from 'class-validator';

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
