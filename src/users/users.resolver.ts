import { NotFoundException, UseGuards } from '@nestjs/common';
import { Query, Mutation, Args, Resolver, ID } from '@nestjs/graphql';

import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UserInput } from './inputs/user.input';
import { UpsertUserArgs } from './args/upsert-user.args';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => UserDto)
  @UseGuards(GqlJwtAuthGuard)
  async user(@Args('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return user;
  }

  @Query(() => [UserDto])
  @UseGuards(GqlJwtAuthGuard)
  async users(/*@Args() queryArgs: FindUsersDto*/): Promise<UserDto[]> {
    return this.usersService.findAll(/*queryArgs*/);
  }

  @Mutation(() => UserDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  async saveUser(@Args() mutationArgs: UpsertUserArgs): Promise<UserDto> {
    const { id, userInput }: { id?: string; userInput: UserInput } = mutationArgs;
    return this.usersService.upsert(id, userInput);
  }

  @Mutation(() => UserDto)
  @UseGuards(GqlJwtAuthGuard, GqlAdminGuard)
  deleteUser(@Args({ name: 'id', type: () => ID }) id: string): Promise<UserDto> {
    return this.usersService.delete(id);
  }
}
