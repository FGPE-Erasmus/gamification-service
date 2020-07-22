import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';
import { ChallengeService } from './challenge.service';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpsertChallengeDto } from './dto/upsert-challenge.dto';

@Resolver(() => Challenge)
export class ChallengesResolver {
  constructor(private readonly challengeService: ChallengeService) {}

  @Mutation(() => Challenge)
  @UseGuards(GqlJwtAuthGuard)
  async createChallenge(@Args() upsertArgs: UpsertChallengeDto): Promise<Challenge> {
    const { id, challengeInput }: { id?: string; challengeInput: CreateChallengeDto } = upsertArgs;
    return this.challengeService.createChallenge(id, challengeInput);
  }
}
