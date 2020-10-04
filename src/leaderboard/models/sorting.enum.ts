import { registerEnumType } from '@nestjs/graphql';

export enum SortingOrder {
  ASC = 'ascending',
  DESC = 'descending',
}

registerEnumType(SortingOrder, { name: 'SortingOrder' });
