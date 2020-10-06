import { UseGuards, NotFoundException } from '@nestjs/common';
import { Resolver, Args, Mutation, ID, Query } from '@nestjs/graphql';

import { GqlUser } from '../common/decorators/gql-user.decorator';
import { GqlJwtAuthGuard } from '../common/guards/gql-jwt-auth.guard';
import { Role } from '../users/models/role.enum';
import { SubmissionService } from './submission.service';
import { SendSubmissionInput } from './inputs/send-submission.input';
import { SubmissionDto } from './dto/submission.dto';

@Resolver(() => SubmissionDto)
export class SubmissionResolver {
  constructor(private readonly submissionService: SubmissionService) {}

  @Query(() => SubmissionDto)
  @UseGuards(GqlJwtAuthGuard)
  async submission(
    @Args('submissionId') id: string,
    @GqlUser('id') userId: string,
    @GqlUser('roles') roles: Role[],
  ): Promise<SubmissionDto> {
    const submission = await this.submissionService.findById(id);
    /*if (userId !== submission.player.user.id && !roles.includes(Role.ADMIN)) {
      throw new Error('User does not have permissions');
    } else {
      if (!submission) {
        throw new NotFoundException(id);
      }
    }*/
    return submission;
  }

  @Query(() => [SubmissionDto])
  @UseGuards(GqlJwtAuthGuard)
  async submissions(
    @GqlUser('id') userId: string,
    @Args('gameId') gameId: string,
    @Args('exerciseId') exerciseId?: string,
  ): Promise<SubmissionDto[]> {
    return await this.submissionService.findByUser(gameId, userId, exerciseId);
  }

  @Mutation(() => SubmissionDto)
  @UseGuards(GqlJwtAuthGuard)
  async createSubmission(@Args('submissionData') input: SendSubmissionInput): Promise<SubmissionDto> {
    return await this.submissionService.create(input);
  }
}
