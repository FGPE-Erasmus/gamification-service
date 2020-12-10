import { Args, Resolver, Query } from '@nestjs/graphql';

import { KeycloakService } from './keycloak.service';
import { UserDto } from './dto/user.dto';
import { Role } from '../common/enums/role.enum';
import { Roles } from './decorators/roles.decorator';

@Resolver(() => UserDto)
export class UserResolver {
  constructor(protected readonly keycloakService: KeycloakService) {}

  @Roles(Role.AUTHOR, Role.TEACHER)
  @Query(() => [UserDto])
  async users(): Promise<UserDto[]> {
    return this.keycloakService.getUsers();
  }

  @Roles(Role.AUTHOR, Role.TEACHER)
  @Query(() => [UserDto])
  async usersByRole(@Args('role') role: Role): Promise<UserDto[]> {
    return this.keycloakService.getUsersByRole(role);
  }

  @Roles(Role.AUTHOR, Role.TEACHER)
  @Query(() => UserDto)
  async user(@Args('id') userId: string): Promise<UserDto> {
    return this.keycloakService.getUser(userId);
  }
}
