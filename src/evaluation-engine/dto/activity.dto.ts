import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Activity')
export class ActivityDto {
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

  @Field({ nullable: true })
  type?: string;

  @Field({ nullable: true })
  difficulty?: string;

  @Field({ nullable: true })
  statement?: string;

  @Field({ nullable: true, defaultValue: false })
  pdf?: boolean;
}
