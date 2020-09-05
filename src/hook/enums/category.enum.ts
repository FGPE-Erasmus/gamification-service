import { registerEnumType } from '@nestjs/graphql';

export enum Category {
  GIVE = 'give',
  TAKE = 'take',
  UPDATE = 'update',
}

registerEnumType(Category, { name: 'Category' });
