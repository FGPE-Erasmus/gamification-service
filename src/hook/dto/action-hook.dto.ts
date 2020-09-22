import { ObjectType, PartialType } from '@nestjs/graphql';

import { ActionHookEntity as ActionHook } from '../entities/action-hook.entity';

@ObjectType('ActionHook')
export class ActionHookDto extends PartialType(ActionHook) {}
