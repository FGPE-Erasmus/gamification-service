import { registerEnumType } from '@nestjs/graphql';

export enum State {
  LOCKED = 'locked',
  HIDDEN = 'hidden',
  OPENED = 'opened',
  FAILED = 'failed',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

registerEnumType(State, { name: 'State' });
