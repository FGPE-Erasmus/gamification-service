import {
  GraphQLID,
  GraphQLInputFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLString,
  GraphQLType,
} from 'graphql';

import { FilterContainsType } from './filter-contains.type';

/**
 * Factory of Filter types.
 *
 * @param {GraphQLObjectType | GraphQLInterfaceType} type the source type
 * @returns {GraphQLList<GraphQLType>} the Filter type
 */
export function FilterType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLList<GraphQLType> {
  return new GraphQLList(
    new GraphQLInputObjectType({
      name: `Filter${type.name}`,
      fields: () =>
        Object.entries(type.getFields())
          .map(field => {
            const [name, value] = field;
            const filters: GraphQLInputFieldConfigMap = {};
            const valueType = getValueType(value.type);

            switch (valueType) {
              case GraphQLID.name:
              case GraphQLString.name: {
                filters[name] = {
                  type: new GraphQLInputObjectType({
                    name: `Filter${name.charAt(0).toUpperCase() + name.slice(1)}${type.name}`,
                    fields: () => ({ ...StringFields }),
                  }),
                };
              }
            }

            return filters;
          })
          .reduce((acc, curr) => {
            acc = { ...acc, ...curr };
            return acc;
          }, {}),
    }),
  );
}

const StringFields: GraphQLInputFieldConfigMap = {
  contains: {
    type: FilterContainsType,
  },
  eq: {
    type: GraphQLString,
  },
  in: {
    type: new GraphQLList(GraphQLString),
  },
  ne: {
    type: GraphQLString,
  },
};

/**
 * Retrieve the value type of a GraphQL Type.
 *
 * @param {GraphQLOutputType} type the GraphQL Type
 * @returns {string} the value type
 */
function getValueType(type: GraphQLOutputType): string {
  if (type instanceof GraphQLNonNull) return type.ofType.toString();
  if (type instanceof GraphQLList) return type.ofType.toString();

  return type.toString();
}
