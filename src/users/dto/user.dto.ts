import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';
import { PlayerDto } from '../../player/dto/player.dto';
import { Role } from '../../common/enums/role.enum';

@ObjectType('User')
export class UserDto {
  @Field(() => ID)
  id?: string;

  @Field()
  name?: string;

  @Field()
  username?: string;

  @Field(() => Email)
  email?: string;

  @HideField()
  password?: string;

  @Field(() => [Role])
  roles?: Role[];

  @Field({ nullable: true })
  photo?: string;

  @Field({ nullable: true })
  telephone?: string;

  @Field(() => Date, { nullable: true })
  birthDate?: Date;

  @Field()
  active?: boolean;

  @Field(() => Date, { nullable: true })
  lastActivityAt?: Date;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;

  @Field(() => [PlayerDto], { nullable: true })
  registrations?: PlayerDto[];
}
