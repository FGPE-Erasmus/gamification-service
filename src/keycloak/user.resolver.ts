import { Args, Resolver, Query } from '@nestjs/graphql';

import { UserDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from './decorators/roles.decorator';
import { UserService } from './user.service';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(protected readonly userService: UserService) {}

  @Roles(Role.TEACHER)
  @Query(() => [UserDto])
  async users(): Promise<UserDto[]> {
    return this.userService.getUsers();
  }

  @Roles(Role.TEACHER)
  @Query(() => [UserDto])
  async usersByRole(@Args('role') role: Role): Promise<UserDto[]> {
    return this.userService.getUsersByRole(role);
  }

  @Roles(Role.TEACHER)
  @Query(() => UserDto)
  async user(@Args('id') userId: string): Promise<UserDto> {
    return this.userService.getUser(userId);
  }
}
