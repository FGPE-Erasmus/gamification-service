import { ObjectType, PartialType } from '@nestjs/graphql';

import { CriteriaEmbed } from '../entities/embedded/criteria.embed';

@ObjectType('Criteria')
export class Criteria extends PartialType(CriteriaEmbed) {}
