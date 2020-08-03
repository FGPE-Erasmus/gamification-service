import { registerEnumType } from '@nestjs/graphql';

export enum SortingOrders {
  ASC = 'ascending',
  DESC = 'descending',
}

registerEnumType(SortingOrders, { name: 'SortingOrders' });
