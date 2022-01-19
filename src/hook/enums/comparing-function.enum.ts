import { registerEnumType } from '@nestjs/graphql';

export enum ComparingFunctionEnum {
  LESS_THAN = 'LESS_THAN',
  GREATER_THAN = 'GREATER_THAN',
  LESS_OR_EQUAL = 'LESS_OR_EQUAL',
  GREAT_OR_EQUAL = 'GREAT_OR_EQUAL',
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  STARTS_WITH = 'STARTS_WITH',
  MATCHES = 'MATCHES',
  NOT_MATCHES = 'NOT_MATCHES',
  IS_EMPTY = 'IS_EMPTY',
  NOT_EMPTY = 'NOT_EMPTY',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

registerEnumType(ComparingFunctionEnum, { name: 'ComparingFunction' });
