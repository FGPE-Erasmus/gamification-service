import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType('Condition')
export class Condition {
  @Field()
  order: number;

  @Field()
  leftEntity: string;

  @Field()
  leftProperty: string;

  @Field()
  comparingFunction: string;

  @Field()
  rightEntity: string;

  @Field()
  rightProperty: string;
}
