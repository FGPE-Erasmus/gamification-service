import { isISO8601 } from 'class-validator';
import { CustomScalar, Scalar } from '@nestjs/graphql';
import { Kind, ValueNode, GraphQLError } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string | Date, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string): Date {
    if (value) {
      return new Date(value);
    }

    return null;
  }

  serialize(value: Date): Date {
    return value;
  }

  parseLiteral(ast: ValueNode): Date {
    if ((ast.kind === Kind.INT || ast.kind === Kind.STRING) && isISO8601(ast.value)) {
      return new Date(ast.value);
    }
    throw new GraphQLError('Date cannot represent an invalid ISO-8601 Date string');
  }
}
