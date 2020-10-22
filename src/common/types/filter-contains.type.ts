import { GraphQLInputObjectType, GraphQLString } from 'graphql';

export const FilterContainsType = new GraphQLInputObjectType({
  name: 'FilterContainsType',
  fields: {
    value: {
      type: GraphQLString,
    },
    options: {
      type: GraphQLString,
    },
  },
});
