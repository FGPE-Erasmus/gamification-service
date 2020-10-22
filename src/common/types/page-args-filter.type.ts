import { IFieldFilter } from '../interfaces/field-filter.interface';

export type PageArgsFilter<T extends string = string, F extends IFieldFilter = IFieldFilter> = Record<T, F>;
