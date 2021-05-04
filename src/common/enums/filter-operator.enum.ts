import { registerEnumType } from '@nestjs/graphql';

export enum FilterOperator {
  eq = '$eq',
  ne = '$ne',
  in = '$in',
  nin = '$nin',
  contains = '$regex',
}

registerEnumType(FilterOperator, { name: 'FilterOperator' });
