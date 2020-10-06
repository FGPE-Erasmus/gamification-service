import { Field, ObjectType, PartialType } from '@nestjs/graphql';

@ObjectType('Condition')
export class ConditionEmbedDto {
  @Field()
  order?: number;

  @Field()
  leftEntity?: string;

  @Field()
  leftProperty?: string;

  @Field()
  comparingFunction?: string;

  @Field()
  rightEntity?: string;

  @Field()
  rightProperty?: string;
}
