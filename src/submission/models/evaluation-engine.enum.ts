import { registerEnumType } from '@nestjs/graphql';

export enum EvaluationEngine {
  MOOSHAK = 'MOOSHAK',
}

registerEnumType(EvaluationEngine, { name: 'EvaluationEngine' });
