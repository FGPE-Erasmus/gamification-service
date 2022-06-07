import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('LtiGrade')
export class LtiGradeDto {

  @Field()
  game: string;

  @Field()
  challenge?: string;

  @Field()
  activity?: string;
}
