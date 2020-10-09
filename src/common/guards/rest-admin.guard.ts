import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { User } from '../../users/models/user.model';

/**
 * Check if the user performing the request has admin role.
 */
@Injectable()
export class RestAdminGuard implements CanActivate {
  constructor(private usersService: UsersService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
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
