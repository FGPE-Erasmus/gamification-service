import { registerEnumType } from '@nestjs/graphql';

export enum GameStateEnum {
  LOCKED = 'LOCKED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

registerEnumType(GameStateEnum, { name: 'GameStateEnum' });
