import { Query, Resolver, Mutation } from '@nestjs/graphql';

@Resolver(() => String)
export class HealthcheckResolver {
  @Query(() => String)
  async queryCheck(): Promise<string> {
    return 'Healthy';
  }

  @Mutation(() => String)
  async mutationCheck(): Promise<string> {
    return 'Healthy';
  }
}
