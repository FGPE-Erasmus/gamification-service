export interface IPageQueryResult<T> {
  totalCount: number;
  beforeCount: number;
  afterCount: number;
  skip: number;
  limit: number;
  nodes: T[];
}
