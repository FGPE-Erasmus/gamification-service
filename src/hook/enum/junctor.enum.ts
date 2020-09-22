import { registerEnumType } from '@nestjs/graphql';

export enum JunctorEnum {
  AND = 'AND',
  OR = 'OR',
}

registerEnumType(JunctorEnum, { name: 'Junctor' });
