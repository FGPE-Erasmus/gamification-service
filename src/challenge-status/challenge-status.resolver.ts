import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { ChallengeStatusService } from './challenge-status.service';
import CreateStatusDto from './dto/create-challenge-status.dto';
import ChallengeStatus from './dto/challenge-status.dto';

@Resolver()
export class ChallengeStatusResolver {
  constructor(private challengeStatusService: ChallengeStatusService) {}

  @Mutation(() => String)
  @UseGuards(GqlJwtAuthGuard)
  async createStatus(@Args() input: CreateStatusDto): Promise<ChallengeStatus> {
    return this.challengeStatusService.createStatus(input);
  }
}
