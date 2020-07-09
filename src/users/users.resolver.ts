import { NotFoundException, UseGuards } from '@nestjs/common';
import { Query, Mutation, Args, Resolver, ID } from '@nestjs/graphql';

import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UserEntity as User } from './entities/user.entity';
import { ListUsersEntity as ListUsers } from './entities/list-users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpsertUserDto } from './dto/upsert-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UsersService } from './users.service';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => User)
  @UseGuards(GqlJwtAuthGuard)
  async user(@Args('id') id: string): Promise<User> {
    const user = await this.usersService.findUserById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return user;
  }

  @Query(() => ListUsers)
  @UseGuards(GqlJwtAuthGuard)
  async users(@Args() queryArgs: FindUsersDto): Promise<ListUsers> {
    return this.usersService.findUsers(queryArgs);
  }

  @Mutation(() => User)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async saveUser(@Args() mutationArgs: UpsertUserDto): Promise<User> {
    const { id, userInput }: { id?: string; userInput: CreateUserDto } = mutationArgs;
    return this.usersService.upsertUser(id, userInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  deleteUser(@Args({ name: 'id', type: () => ID }) id: string): Promise<boolean> {
    return this.usersService.deleteUser(id);
  }
}
