import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-express';
import { IsDefined } from 'class-validator';
import { FileUpload } from 'graphql-upload';

@ArgsType()
export class ValidateArgs {
  @Field()
  gameId: string;

  @Field()
  exerciseId: string;

  @Field(() => GraphQLUpload)
  @IsDefined()
  file: Promise<FileUpload>;

  @Field(() => [String], { defaultValue: [] })
  inputs?: string[];
}
