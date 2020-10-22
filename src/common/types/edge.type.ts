import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';

import { FromType, IFromTypeOptions } from './from.type';

/**
 * Page Edge Type Factory.
 *
 * @param {FromType} type the source type
 * @param {IFromTypeOptions} options the options for the edge type
 * @returns {GraphQLObjectType} the graphQL edge type
 */
export function EdgeType(type: FromType, options?: IFromTypeOptions): GraphQLObjectType {
  return new GraphQLObjectType({
    name: options && options.edgeTypeName ? options.edgeTypeName : `Edged${type.name}`,
    fields: () => ({
      node: {
        type,
      },
      cursor: {
        type: new GraphQLNonNull(GraphQLString),
      },
    }),
  });
}
