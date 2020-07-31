import { registerEnumType } from '@nestjs/graphql';

export enum Difficulty {
  BEGINNER = 'beginner',
  EASY = 'easy',
  AVERAGE = 'average',
  HARD = 'hard',
  MASTER = 'master',
}

registerEnumType(Difficulty, { name: 'Difficulty' });
