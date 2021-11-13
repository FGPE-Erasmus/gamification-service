import { ArgsType, Field } from '@nestjs/graphql';
import { IsDefined, ValidateNested } from 'class-validator';
import { FileUpload, GraphQLUpload } from 'graphql-upload';

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
