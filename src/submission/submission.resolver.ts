import { SubmissionService } from './submission.service';
import { Resolver, Args, Mutation, ID, Query } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { SubmissionEntity as Submission } from './entity/submission.entity';
import { SubmissionDto } from './dto/submission.dto';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { GqlSubmissionAuthGuard } from 'src/common/guards/gql-submission-auth.guard';

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => Submission)
  @UseGuards(GqlJwtAuthGuard, GqlSubmissionAuthGuard)
  async submission(@Args({ name: 'id', type: () => ID }) id: string): Promise<Submission> {
    const submission = await this.submissionService.getSubmission(id);
    if (!submission) {
      throw new NotFoundException(id);
    }
    return submission;
  }

  @Query(() => [Submission])
  @UseGuards(GqlJwtAuthGuard)
  async submissions(
    @Args({ name: 'exerciseId', type: () => String }) exerciseId: string,
    @GqlUser('id') playerId: string,
  ): Promise<Submission[]> {
    return await this.submissionService.getAllSubmissions(exerciseId, playerId);
  }

  @Mutation(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
  async createSubmission(@Args() mutationArgs: SubmissionDto): Promise<Submission> {
    return await this.submissionService.sendSubmission(mutationArgs);
  }
}
