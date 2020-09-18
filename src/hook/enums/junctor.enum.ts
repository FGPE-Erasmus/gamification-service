import { registerEnumType } from '@nestjs/graphql';

export enum Junctor {
  AND = 'AND',
  OR = 'OR',
}

registerEnumType(Junctor, { name: 'Junctor' });
