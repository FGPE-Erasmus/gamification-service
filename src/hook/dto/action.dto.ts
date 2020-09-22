import { ObjectType, PartialType } from '@nestjs/graphql';

import { ActionEmbed } from '../entities/embedded/action.embed';

@ObjectType('Action')
export class Action extends PartialType(ActionEmbed) {}
