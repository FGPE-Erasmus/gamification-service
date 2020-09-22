import { IntersectionType, ObjectType } from '@nestjs/graphql';

import { ActionHookDto } from './action-hook.dto';
import { ScheduledHookDto } from './scheduled-hook.dto';

@ObjectType()
export class HookDto extends IntersectionType(ActionHookDto, ScheduledHookDto) {}
