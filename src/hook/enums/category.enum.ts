import { registerEnumType } from '@nestjs/graphql';

export enum Category {
  GIVE = 'give',
  TAKE_OUT = 'take out',
  SET = 'set',
}

registerEnumType(Category, { name: 'Category' });
