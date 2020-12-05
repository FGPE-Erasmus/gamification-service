import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GroupInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
