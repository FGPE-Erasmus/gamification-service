import { GraphQLInterfaceType, GraphQLObjectType } from 'graphql';

export type FromType = GraphQLObjectType | GraphQLInterfaceType;

export interface IFromTypeOptions {
  pageTypeName?: string;
  edgeTypeName?: string;
}
