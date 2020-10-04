import { registerEnumType } from '@nestjs/graphql';

export enum State {
  AVAILABLE = 'AVAILABLE',
  LOCKED = 'LOCKED',
  HIDDEN = 'HIDDEN',
  OPENED = 'OPENED',
  FAILED = 'FAILED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

registerEnumType(State, { name: 'State' });
