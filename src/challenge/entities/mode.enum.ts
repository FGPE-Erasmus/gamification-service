import { registerEnumType } from '@nestjs/graphql';

export enum Mode {
  NORMAL = 'normal',
  SHAPESHIFTER = 'shapeshifter',
  SHORTENING = 'shortening',
  SPEEDUP = 'speedup',
  HACK_IT = 'hack it',
  TIME_BOMB = 'time bomb',
  DUEL = 'duel',
}

registerEnumType(Mode, { name: 'Mode' });
