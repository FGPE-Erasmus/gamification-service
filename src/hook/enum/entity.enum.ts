import { registerEnumType } from '@nestjs/graphql';

export enum EntityEnum {
  FIXED = 'FIXED',
  EVENT = 'EVENT',
  ACTION = 'ACTION',
  PLAYER = 'PLAYER',
  ENVIRONMENT = 'ENVIRONMENT',
}

registerEnumType(EntityEnum, { name: 'Entity' });
