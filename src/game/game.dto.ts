import { Field, ArgsType } from '@nestjs/graphql';
import { MinLength, MaxLength } from 'class-validator';

@ArgsType()
export default class GameDto {
    @Field()
    name: string;

    @Field()
    startDate: Date;

    @Field()
    endDate: Date;

    @Field()
    userIds: string;

    @Field()
    zipGEdIL: string; //for now
}
