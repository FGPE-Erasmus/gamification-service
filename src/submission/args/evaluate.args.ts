import { ArgsType, Field } from '@nestjs/graphql';
import { IsDefined } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

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
