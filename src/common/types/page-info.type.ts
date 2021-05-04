import { Field, ObjectType } from '@nestjs/graphql';

import { IPageInfo } from '../interfaces/page-info.interface';

@ObjectType()
export class PageInfo implements IPageInfo {
  @Field({ nullable: true })
  public startCursor: string;

  @Field({ nullable: true })
  public endCursor: string;

  @Field({ nullable: true })
  public hasPrevPage: boolean;

  @Field({ nullable: true })
  public hasNextPage: boolean;
}
