import { Field, ID, ObjectType } from '@nestjs/graphql';
import { PlayerDto } from '../../player/dto/player.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';

@ObjectType('Game')
export class GameDto {

  @Field(() => ID)
  readonly id: string;

  @Field()
  name: string;

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

  @Field(() => [PlayerDto])
  players?: PlayerDto[];

  @Field(() => [SubmissionDto])
  submissions?: SubmissionDto[];
}
