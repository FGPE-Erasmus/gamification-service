import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES_REQUIRING_ENROLLMENT = 'rolesRequiringEnrollment';

export const RolesRequiringEnrollment = (key: string, ...roles: string[]): CustomDecorator =>
  SetMetadata(ROLES_REQUIRING_ENROLLMENT, [key, ...roles]);
