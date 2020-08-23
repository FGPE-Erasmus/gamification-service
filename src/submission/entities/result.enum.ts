import { registerEnumType } from '@nestjs/graphql';

export enum Result {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

registerEnumType(Result, { name: 'Result' });
