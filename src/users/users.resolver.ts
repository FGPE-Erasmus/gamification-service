import { NotFoundException, UseGuards, Inject } from '@nestjs/common';
import { Query, Mutation, Subscription, Args, Resolver, ID } from '@nestjs/graphql';

import { GqlAdminGuard } from '../common/guards/gql-admin.guard';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { UserInput } from './inputs/user.input';
import { UpsertUserArgs } from './args/upsert-user.args';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { PubSub } from 'graphql-subscriptions';

@Resolver(() => UserDto)
export class UsersResolver {
  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    protected readonly usersService: UsersService,
    protected readonly toDtoMapper: UserToDtoMapper,
  ) {}

  @Subscription(returns => String)
  message() {
    return this.pubSub.asyncIterator('message');
  }

  @Query(() => UserDto)
  @UseGuards(GqlJwtAuthGuard)
  async user(@Args('id') id: string): Promise<UserDto> {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException(id);
    }
    return this.toDtoMapper.transform(user);
  }

  @Query(() => [UserDto])
  @UseGuards(GqlJwtAuthGuard)
  async users(/*@Args() queryArgs: FindUsersDto*/): Promise<UserDto[]> {
    const users = await this.usersService.findAll(/*queryArgs*/);
    return Promise.all(users.map(async user => this.toDtoMapper.transform(user)));
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
