import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ClassType } from 'type-graphql';

import { IEdge } from '../interfaces/edge.interface';
import { IPage } from '../interfaces/page.interface';
import { PageInfo } from './page-info.type';

export function Page<T>(ItemType: ClassType<T>): any {
  @ObjectType(`Paginated${ItemType.name}Edge`)
  abstract class EdgeClass implements IEdge<T> {
    @Field()
    public cursor: string;

    @Field(() => ItemType)
    public node: T;
  }

  @ObjectType({ isAbstract: true })
  abstract class PageClass implements IPage<T> {
    @Field(() => PageInfo, { nullable: true })
    public pageInfo: PageInfo;

    @Field(() => Int)
    public totalCount: number;

    @Field(() => [EdgeClass])
    public edges: EdgeClass[];
  }

  return PageClass;
}
