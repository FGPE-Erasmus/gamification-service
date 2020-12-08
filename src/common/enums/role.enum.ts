import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher',
  AUTHOR = 'author',
}

registerEnumType(Role, { name: 'Role' });
