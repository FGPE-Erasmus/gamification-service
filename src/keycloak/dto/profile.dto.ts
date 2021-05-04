import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('Profile')
export class ProfileDto {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  emailVerified?: boolean;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;
}
