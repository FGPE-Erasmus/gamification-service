import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class PlayerInput {
  @Field()
  user: string;

  @Field()
  game: string;
}
