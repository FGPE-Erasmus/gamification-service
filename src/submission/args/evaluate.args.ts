import { ArgsType, Field } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-core';
import { IsDefined } from 'class-validator';
import { FileUpload } from 'graphql-upload';

@ArgsType()
export class EvaluateArgs {
  @Field()
  gameId: string;

  @Field()
  exerciseId: string;

  @Field(() => GraphQLUpload)
  @IsDefined()
  file: Promise<FileUpload>;
}
