import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  STUDENT = 'student',
  TEACHER = 'teacher',
}

registerEnumType(Role, { name: 'Role' });
