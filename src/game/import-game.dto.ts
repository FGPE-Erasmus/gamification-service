import { Field, ArgsType } from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-core';
import { FileUpload } from 'graphql-upload';
import GameDto from './game.dto';

@ArgsType()
export default class ImportGameDto extends GameDto {
  @Field(() => GraphQLUpload)
  file: FileUpload;
}
