import { registerEnumType } from '@nestjs/graphql';

export enum SortingOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortingOrder, { name: 'SortingOrder' });
