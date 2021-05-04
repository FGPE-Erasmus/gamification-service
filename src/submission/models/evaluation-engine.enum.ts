import { registerEnumType } from '@nestjs/graphql';

export enum EvaluationEngine {
  MOOSHAK = 'MOOSHAK',
  BASE = 'BASE',
}

registerEnumType(EvaluationEngine, { name: 'EvaluationEngine' });
