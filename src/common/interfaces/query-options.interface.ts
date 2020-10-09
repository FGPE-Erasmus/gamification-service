import { OrderBy } from './order-by.interface';

export interface IQueryOptions<T, O extends OrderBy<T>> {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  orderBy?: O[];
}
