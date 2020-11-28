import { Field, ObjectType } from '@nestjs/graphql';

import { PlayerDto } from '../../player/dto/player.dto';
import { SubmissionDto } from '../../submission/dto/submission.dto';

@ObjectType('PlayerSubmissions')
export class PlayerSubmissionsDto {
  @Field(() => PlayerDto)
  player?: string;

  @Field(() => [SubmissionDto], { defaultValue: () => ({}) })
  submissions?: string[];
}
