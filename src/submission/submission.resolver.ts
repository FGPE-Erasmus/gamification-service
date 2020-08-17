import { SubmissionService } from './submission.service';
import { Resolver, Args, Mutation, ID, Query } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { SubmissionEntity as Submission } from './entity/submission.entity';
import { SubmissionDto } from './dto/submission.dto';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { EvaluationEvent } from './dto/evaluation-event.dto';

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
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
    @Args({ name: 'playerId', type: () => String }) playerId: string,
  ): Promise<Submission[]> {
    return await this.submissionService.getAllSubmissions(exerciseId, playerId);
  }

  @Query(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
  async submissionResultReceived(@Args() data: EvaluationEvent): Promise<Submission> {
    // here I imagine that when EE is finished with evluation and it sends back only the the final result and id so as to update this field in the repo of this exercise
    return await this.submissionService.onSubmissionEvaluated(data);
  }

  @Mutation(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
  async createSubmission(@Args() mutationArgs: SubmissionDto): Promise<Submission> {
    // does 'creation' means only saving to the repo or save+send to EE?
    return await this.submissionService.sendSubmission(mutationArgs);
  }
}
