import { OrderByOptions } from '../types/order-by-options.type';
import { PageArgsFilter } from '../types/page-args-filter.type';

export interface IPageArgs<
  S extends string = string,
  D extends string = 'ASC' | 'DESC',
  F extends PageArgsFilter = PageArgsFilter
> {
  filters?: F[];
  queryOptions?: {
    first?: number;
    last?: number;
    before?: string;
    after?: string;
    orderBy?: OrderByOptions<S, D>;
  };
}
