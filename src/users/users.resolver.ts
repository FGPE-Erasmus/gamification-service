import { NotFoundException } from '@nestjs/common';
import { Query, Mutation, Args, Resolver, ID } from '@nestjs/graphql';

import { UserInput } from './inputs/user.input';
import { UpsertUserArgs } from './args/upsert-user.args';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(protected readonly usersService: UsersService, protected readonly toDtoMapper: UserToDtoMapper) {}

  @Query(() => UserDto)
  async user(@Args('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return this.toDtoMapper.transform(user);
  }

  @Roles(Role.AUTHOR, Role.TEACHER)
  @Query(() => [UserDto])
  async users(/*@Args() queryArgs: FindUsersDto*/): Promise<UserDto[]> {
    const users = await this.usersService.findAll(/*queryArgs*/);
    return Promise.all(users.map(async user => this.toDtoMapper.transform(user)));
  }

  @Roles(Role.AUTHOR)
  @Mutation(() => UserDto)
  async saveUser(@Args() mutationArgs: UpsertUserArgs): Promise<UserDto> {
    const { id, userInput }: { id?: string; userInput: UserInput } = mutationArgs;
    return this.usersService.upsert(id, userInput);
  }

  @Roles(Role.AUTHOR)
  @Mutation(() => UserDto)
  deleteUser(@Args({ name: 'id', type: () => ID }) id: string): Promise<UserDto> {
    return this.usersService.delete(id);
  }
}
