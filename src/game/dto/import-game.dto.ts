import { Field, ArgsType } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-core';
import { IsDefined } from 'class-validator';
import { FileUpload } from 'graphql-upload';

import GameDto from './game.dto';

@ArgsType()
export default class ImportGameDto extends GameDto {
  @Field(() => GraphQLUpload)
  @IsDefined()
  file: Promise<FileUpload>;
}
