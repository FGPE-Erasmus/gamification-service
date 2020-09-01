import { Junctor } from '../enums/junctor.enum';
import { ObjectType, Field } from '@nestjs/graphql';
import { IsArray } from 'class-validator';

@ObjectType('Criteria')
export class Criteria {
  @Field()
  @IsArray()
  conditions: string[];

  @Field()
  @IsArray()
  junctors: Junctor[];
}
