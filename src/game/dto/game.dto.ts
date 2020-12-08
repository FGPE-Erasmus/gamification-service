import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlayerDto } from '../../player/dto/player.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';
import { UserDto } from '../../keycloak/dto/user.dto';

@ObjectType('Game')
export class GameDto {
  @Field(() => ID)
  id?: string;

  @Field()
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  gedilLayerId?: string;

  @Field({ nullable: true })
  gedilLayerDescription?: string;

  @Field({ nullable: true })
  startDate?: Date;

  @Field({ nullable: true })
  endDate?: Date;

  @Field(() => [UserDto])
  instructors?: string[];

  @Field(() => [PlayerDto])
  players?: string[];

  @Field(() => [SubmissionDto])
  submissions?: string[];

  @Field(() => Date)
  createdAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}
