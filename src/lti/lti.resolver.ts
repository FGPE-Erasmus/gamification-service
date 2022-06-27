import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { CreatePlatformArgs } from './dto/create-platform.args';
import { LtiService } from './lti.service';
import { PlatformDto } from './dto/platform.dto';

@Resolver(() => PlatformDto)
export class LtiResolver {
  constructor(protected readonly ltiService: LtiService) {}

  @Roles(Role.TEACHER)
  @Mutation(() => PlatformDto)
  async registerPlatform(@Args() platformDto: CreatePlatformArgs): Promise<any> {
    return this.ltiService.registerPlatform(platformDto);
  }
}
