import { SubmissionService } from './submission.service';
import { Resolver, Args, Mutation, ID, Query } from '@nestjs/graphql';
import { UseGuards, NotFoundException } from '@nestjs/common';
import { SubmissionEntity as Submission } from './entities/submission.entity';
import { SubmissionDto } from './dto/submission.dto';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { Role } from 'src/users/entities/role.enum';

@Resolver(() => Submission)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
  async submission(
    @Args('submissionId') id: string,
    @GqlUser('id') playerId: string,
    @GqlUser('roles') roles: Role[],
  ): Promise<Submission> {
    const submission = await this.submissionService.getSubmission(id);

    if (playerId !== submission.playerId && !roles.includes(Role.ADMIN)) {
      throw new Error('User does not have permissions');
    } else {
      if (!submission) {
        throw new NotFoundException(id);
      }
      return submission;
    }
  }

  @Query(() => [Submission])
  @UseGuards(GqlJwtAuthGuard)
  async submissions(@Args('exerciseId') exerciseId: string, @GqlUser('id') playerId: string): Promise<Submission[]> {
    return await this.submissionService.getAllSubmissions(exerciseId, playerId);
  }

  @Mutation(() => Submission)
  @UseGuards(GqlJwtAuthGuard)
  async createSubmission(@Args() mutationArgs: SubmissionDto): Promise<Submission> {
    return await this.submissionService.sendSubmission(mutationArgs);
  }
}
