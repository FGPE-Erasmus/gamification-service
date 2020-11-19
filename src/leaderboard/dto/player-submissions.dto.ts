import { Field, ObjectType } from '@nestjs/graphql';
import { Submission } from 'src/submission/models/submission.model';

import { PlayerDto } from '../../player/dto/player.dto';

@ObjectType('PlayerSubmissions')
export class PlayerSubmissionsDto {
  @Field(() => PlayerDto)
  player?: PlayerDto;

  @Field(() => [Submission], { defaultValue: () => ({}) })
  submissions?: Submission[];
}
