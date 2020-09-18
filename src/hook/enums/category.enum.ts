import { registerEnumType } from '@nestjs/graphql';

export enum Category {
  GIVE = 'GIVE',
  TAKE = 'TAKE',
  UPDATE = 'UPDATE',
}

registerEnumType(Category, { name: 'Category' });
