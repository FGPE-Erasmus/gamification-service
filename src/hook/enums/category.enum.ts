import { registerEnumType } from '@nestjs/graphql';

export enum CategoryEnum {
  GIVE = 'GIVE',
  TAKE = 'TAKE',
  UPDATE = 'UPDATE',
}

registerEnumType(CategoryEnum, { name: 'Category' });
