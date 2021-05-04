import {
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLNonNull,
  GraphQLObjectType,
} from 'graphql';

/**
 * Retrieve the Fields enum type.
 *
 * @param {GraphQLObjectType | GraphQLInterfaceType} type the type with fields to extract
 * @returns {GraphQLEnumType} the enum type with fields from type
 */
function FieldsEnumType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLEnumType {
  return new GraphQLEnumType({
    name: `FieldsEnum${type.name}`,
    values: Object.keys(type.getFields())
      .map(key => ({ [key]: { value: key } }))
      .reduce((acc, curr) => {
        acc = {
          ...curr,
          ...acc,
        };
        return acc;
      }, {}),
  });
}

/** Order By Direction Type */
const OrderByDirectionType = new GraphQLEnumType({
  name: 'OrderByDirection',
  values: {
    ASC: {
      value: 'ASC',
    },
    DESC: {
      value: 'DESC',
    },
  },
});

/**
 * Retrieve the "order by" type.
 *
 * @param {GraphQLObjectType | GraphQLInterfaceType} type type to wrap
 * @returns {GraphQLInputObjectType} the "order by" input type
 */
export function OrderByType(type: GraphQLObjectType | GraphQLInterfaceType): GraphQLInputObjectType {
  return new GraphQLInputObjectType({
    name: 'OrderByType',
    fields: () => ({
      field: {
        type: new GraphQLNonNull(FieldsEnumType(type)),
      },
      direction: {
        type: new GraphQLNonNull(OrderByDirectionType),
      },
    }),
  });
}
