import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class GroupInput {
  @Field()
  game: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  imageUrl?: string;
}
