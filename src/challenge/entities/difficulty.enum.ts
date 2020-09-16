import { registerEnumType } from '@nestjs/graphql';

export enum Difficulty {
  BEGINNER = 'BEGINNER',
  EASY = 'EASY',
  AVERAGE = 'AVERAGE',
  HARD = 'HARD',
  MASTER = 'MASTER',
}

registerEnumType(Difficulty, { name: 'Difficulty' });
