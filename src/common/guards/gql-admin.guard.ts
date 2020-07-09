import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { UserEntity as User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

/**
 * Check if the user performing the request has admin role.
 */
@Injectable()
export class GqlAdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  canActivate(context: ExecutionContext): boolean {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    if (request.user) {
      const user = request.user as User;
      if (this.usersService.isAdmin(user)) {
        return true;
      }
      throw new Error('User does not have permissions');
    }
    throw new Error('User is not logged in');
  }
}
