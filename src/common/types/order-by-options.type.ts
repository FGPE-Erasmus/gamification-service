import { IOrderByOption } from '../interfaces/order-by-option.interface';

export type OrderByOptions<S extends string = string, D extends string = 'ASC' | 'DESC'> = Array<IOrderByOption<S, D>>;
