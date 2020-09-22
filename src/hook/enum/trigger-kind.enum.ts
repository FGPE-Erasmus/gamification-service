import { registerEnumType } from '@nestjs/graphql/dist';

export enum TriggerKindEnum {
  ACTION = 'ACTION',
  SCHEDULED = 'SCHEDULED',
}

registerEnumType(TriggerKindEnum, { name: 'TriggerKind' });
