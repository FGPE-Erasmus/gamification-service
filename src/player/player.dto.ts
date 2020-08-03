import { ArgsType, Field } from '@nestjs/graphql';

@ArgsType()
export class PlayerDto {
  @Field()
  userId: string;

  @Field({ defaultValue: 0 })
  points: number;
}
