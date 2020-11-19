import { Field, ArgsType } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-express';
import { IsDefined, ValidateNested } from 'class-validator';
import { FileUpload } from 'graphql-upload';

import { GameInput } from '../inputs/game.input';

@ArgsType()
export class ImportGameArgs {
  @Field()
  @ValidateNested()
  gameInput: GameInput;

  @Field(() => GraphQLUpload)
  @IsDefined()
  file: Promise<FileUpload>;
}
