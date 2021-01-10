import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ProgrammingLanguage')
export class ProgrammingLanguageDto {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  extension?: string;

  @Field({ nullable: true })
  compiler?: string;

  @Field({ nullable: true })
  version?: string;

  @Field({ nullable: true })
  compile?: string;

  @Field({ nullable: true })
  execute?: string;
}
