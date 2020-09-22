import { ObjectType, PartialType } from '@nestjs/graphql';

import { ConditionEmbed } from '../entities/embedded/condition.embed';

@ObjectType('Condition')
export class ConditionDto extends PartialType(ConditionEmbed) {}
