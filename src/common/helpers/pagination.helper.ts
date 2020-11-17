import { Document, Types } from 'mongoose';

import { OrderByOptions } from '../types/order-by-options.type';
import { PageArgsFilter } from '../types/page-args-filter.type';
import { FilterOperator } from '../enums/filter-operator.enum';
import { base64Decode, base64Encode, escapeRegExp, fieldKey, isNumericString } from '../utils/string.utils';
import { IPageQueryResult } from '../interfaces/page-query-result.interface copy';
import { IPage } from '../interfaces/page.interface';
import { isNumber } from '../utils/type-checking.utils';

/* eslint-disable */

/**
 * Retrieve the Sort Order.
 *
 * @param {OrderByOptions} orderByOptions the options for sorting.
 * @returns {string} the sorting order
 */
export function getSortOrder(orderByOptions: OrderByOptions = []): string {
  return orderByOptions.reduce((acc, curr, index) => {
    const field = fieldKey(curr.field);
    acc = acc + `${index > 0 ? ' ' : ''}${curr.direction === 'DESC' ? '-' : ''}${field}`;
    return acc;
  }, '');
}

/**
 * Apply a Filter to a Query.
 *
 * @param filters       Filters
 * @returns             Filtered Document Query
 */
export function getQueryFilter(filters: PageArgsFilter[]): any[] {
  const queryFilter: any[] = [];

  filters.forEach(filter => {
    const filterConditions: any[] = [];

    Object.keys(filter).forEach((field: string) => {
      Object.keys(filter[field]).forEach((operator: string) => {
        const operatorKey = operator as keyof typeof FilterOperator;
        const filterKey = FilterOperator[operatorKey];

        switch (operatorKey) {
          case 'contains': {
            const filterValue = filter[field][operatorKey]!;

            filterConditions.push({
              [fieldKey(field)]: {
                [filterKey]: escapeRegExp(filterValue.value),
                $options: filterValue.options || '',
              },
            });
            return;
          }
          default: {
            const filterValue = filter[field][operatorKey];

            filterConditions.push({
              [fieldKey(field)]: {
                [filterKey]: filterValue,
              },
            });
            return;
          }
        }
      });
    });

    if (filterConditions.length > 0) queryFilter.push({ $and: filterConditions });
  });

  return queryFilter;
}

/**
 * Decode a Cursor.
 *
 * @param cursor        Encoded Cursor
 * @returns             Decoded Cursor
 */
export function decodeCursor(cursor: string = null!): string | number {
  if (!cursor) return null!;

  try {
    const decoded = base64Decode(cursor);
    const isNumeric = isNumericString(decoded);

    if (!Types.ObjectId.isValid(decoded) && !isNumeric) {
      throw new Error('Invalid Cursor');
    }

    return isNumeric ? +decoded : decoded;
  } catch (err) {
    return null!;
  }
}

/**
 * Retrieve the Limit from the Before Cursor.
 *
 * @param before        Decoded Before Cursor
 * @param totalCount    Total Count
 * @returns             Before Limit
 */
export function getBeforeLimit(before: string | number, totalCount: number): number {
  const cursorUpperBound = isNumber(before) ? (before as number) - 1 : Infinity;
  return Math.min(cursorUpperBound, totalCount);
}

/**
 * Retrieve the Skip from the After Cursor.
 *
 * @param after           Decoded After Cursor
 * @returns               After Skip
 */
export function getAfterSkip(after: string | number): number {
  return isNumber(after) ? (after as number) : 0;
}

/**
 * Retrieve the Query Limit.
 *
 * @param beforeCount     Before Count
 * @param first           First
 * @returns               Limit
 */
export function getLimit(beforeCount: number, first = Infinity): number {
  return Math.min(beforeCount, first);
}

/**
 * Retrieve the Query Skip.
 *
 * @param afterCount      After Count
 * @param last            Last
 * @param totalCount      Total Count
 * @returns               Skip
 */
export function getSkip(afterCount: number, totalCount: number, last = Infinity): number {
  const diff = afterCount - Math.min(Math.max(last, 0), afterCount);
  return totalCount - afterCount + diff;
}

/**
 * Retrieve the Query Offset.
 *
 * @param decodedCursor         Decoded Cursor
 * @param type                  Offset Type
 * @returns                     Offset
 */
export function getOffset(decodedCursor: string, type: 'BEFORE' | 'AFTER'): { _id?: Record<string, string> } {
  if (!decodedCursor) return {};

  const operator = type === 'BEFORE' ? '$lt' : '$gt';

  return {
    _id: {
      [operator]: decodedCursor,
    },
  };
}

/**
 * Transform a Query Result into a properly structured Page.
 *
 * @param result        Query Result
 * @returns             Page
 */
export function toPage<T extends Document>(result: IPageQueryResult<T>): IPage<T> {
  const edges = result.nodes.map(node => ({
    cursor: node.id ? base64Encode(node.id.toString()) : null!,
    node,
  }));

  return {
    totalCount: result.totalCount,
    edges,
    pageInfo: {
      startCursor: edges.length > 0 ? edges[0].cursor : null!,
      endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null!,
      hasPrevPage: result.afterCount < result.totalCount || result.skip > 0,
      hasNextPage: result.beforeCount < result.totalCount || result.afterCount - result.limit > 0,
    },
  };
}
