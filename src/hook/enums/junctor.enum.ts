import { registerEnumType } from '@nestjs/graphql';

export enum Junctor {
  AND = 'and',
  OR = 'or',
}

registerEnumType(Junctor, { name: 'Junctor' });
