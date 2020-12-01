import { Query, Resolver } from '@nestjs/graphql';

@Resolver(() => String)
export class HealthcheckResolver {
  @Query(() => String)
  async alive(): Promise<boolean> {
    return true;
  }
}
