import { UseGuards } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeService } from './challenge.service';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';

@Resolver()
export class ChallengeResolver {
  constructor(private readonly challengeService: ChallengeService) {}

  @Query(() => [Challenge])
  @UseGuards(GqlJwtAuthGuard)
  async challenges(): Promise<Challenge[]> {
    return this.challengeService.findAll();
  }
}
