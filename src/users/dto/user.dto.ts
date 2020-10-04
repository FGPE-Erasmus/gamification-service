import { Field, HideField, ID, ObjectType } from '@nestjs/graphql';

import { EmailScalar as Email } from '../../common/scalars/email.scalar';
import { Player } from '../../player/models/player.model';
import { Role } from '../models/role.enum';
import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('User')
export class UserDto {

  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  username: string;

  @Field(() => Email)
  email: string;

  @HideField()
  password: string;

  @Field(() => [ Role ])
  roles: Role[];

  @Field({ nullable: true })
  photo?: string;

  @Field({ nullable: true })
  telephone?: string;

  @Field(() => Date, { nullable: true })
  birthDate?: Date;

  @Field()
  active: boolean;

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date)
  updatedAt?: Date;

  @Field(() => [ PlayerDto ])
  registrations: PlayerDto[];
}
