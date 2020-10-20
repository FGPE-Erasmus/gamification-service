import { registerEnumType } from '@nestjs/graphql';

export enum StateEnum {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  HIDDEN = 'HIDDEN',
  OPENED = 'OPENED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

registerEnumType(StateEnum, { name: 'State' });
