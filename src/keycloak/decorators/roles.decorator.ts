import { CustomDecorator, SetMetadata } from '@nestjs/common';

export const ROLES = 'roles';

export const Roles = (...roles: string[]): CustomDecorator => SetMetadata(ROLES, roles);
