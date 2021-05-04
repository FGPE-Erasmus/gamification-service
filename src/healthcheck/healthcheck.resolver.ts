import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '../keycloak/decorators/public.decorator';

@Resolver(() => String)
export class HealthcheckResolver {
  @Public()
  @Query(() => String)
  async alive(): Promise<boolean> {
    return true;
  }
}
