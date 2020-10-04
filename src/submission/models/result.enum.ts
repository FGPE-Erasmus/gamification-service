import { registerEnumType } from '@nestjs/graphql';

export enum Result {
  ACCEPT = 'ACCEPT',
  WRONG_ANSWER = 'WRONG_ANSWER',
  TIMEOUT = 'TIMED_OUT',
  OUTPUT_LIMIT_OVERFLOW = 'OUTPUT_LIMIT_OVERFLOW',
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
}

registerEnumType(Result, { name: 'Result' });
