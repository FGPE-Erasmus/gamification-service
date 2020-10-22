export interface IPage<T> {
  totalCount: number;
  edges: Array<IPageNode<T>>;
  pageInfo: {
    startCursor: string;
    endCursor: string;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
