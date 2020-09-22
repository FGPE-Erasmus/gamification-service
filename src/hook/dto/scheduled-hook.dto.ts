import { ObjectType, PartialType } from '@nestjs/graphql';

import { ScheduledHookEntity as ScheduledHook } from '../entities/scheduled-hook.entity';

@ObjectType('ScheduledHook')
export class ScheduledHookDto extends PartialType(ScheduledHook) {}
