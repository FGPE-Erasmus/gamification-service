import { Field, InputType, Int, ReturnTypeFuncValue } from '@nestjs/graphql';
import { ClassType } from 'type-graphql';

import { OrderByDirection } from '../enums/order-by-direction.enum';
import { IQueryOptions } from '../interfaces/query-options.interface';
import { OrderBy } from '../interfaces/order-by.interface';

export function QueryOptions<T, S extends ReturnTypeFuncValue>(ItemType: ClassType, SortableItemType: S): any {
  @InputType({ isAbstract: true })
  abstract class OrderByClass implements OrderBy<keyof typeof SortableItemType> {
    @Field(() => SortableItemType)
    public field: keyof typeof SortableItemType;

    @Field(() => OrderByDirection)
    public direction: keyof typeof OrderByDirection;
  }

  @InputType(`Paginated${ItemType.name}QueryOptions`)
  abstract class PaginatedQueryOptionsClass implements IQueryOptions<keyof typeof SortableItemType, OrderByClass> {
    @Field(() => Int, { nullable: true })
    public first: number;

    @Field(() => Int, { nullable: true })
    public last: number;

    @Field({ nullable: true })
    public before: string;

    @Field({ nullable: true })
    public after: string;

    @Field(() => [OrderByClass], { nullable: 'itemsAndList' })
    public orderBy: OrderByClass[];
  }

  return PaginatedQueryOptionsClass;
}
