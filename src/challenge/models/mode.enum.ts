import { registerEnumType } from '@nestjs/graphql';

export enum Mode {
  NORMAL = 'NORMAL',
  SHAPESHIFTER = 'SHAPESHIFTER',
  SHORTENING = 'SHORTENING',
  SPEEDUP = 'SPEEDUP',
  HACK_IT = 'HACK_IT',
  TIME_BOMB = 'TIME_BOMB',
  DUEL = 'DUEL',
}

registerEnumType(Mode, { name: 'Mode' });
