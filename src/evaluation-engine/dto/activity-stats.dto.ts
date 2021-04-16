import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('ActivityStats')
export class ActivityStatsDto {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  timeout?: number;

  @Field({ nullable: true })
  color?: string;
}
