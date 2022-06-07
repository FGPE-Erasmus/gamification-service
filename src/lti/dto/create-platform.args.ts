import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class CreatePlatformArgs {
  @Field()
  url: string;

  @Field()
  name: string;

  @Field()
  clientId: string;
}
