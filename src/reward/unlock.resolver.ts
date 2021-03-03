import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { ChallengeDto } from '../challenge/dto/challenge.dto';
import { Challenge } from '../challenge/models/challenge.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { UnlockDto } from './dto/unlock.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => UnlockDto)
export class UnlockResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [UnlockDto])
  async unlocks(@Args('gameId') gameId: string): Promise<UnlockDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.UNLOCK);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @ResolveField('challenges', () => [ChallengeDto])
  async challenges(@Parent() root: UnlockDto): Promise<ChallengeDto[]> {
    const { challenges: challengeIds } = root;
    if (!challengeIds || challengeIds.length === 0) {
      return [];
    }
    const challenges: Challenge[] = await this.challengeService.findAll({
      _id: { $in: challengeIds },
    });
    return Promise.all(challenges.map(async challenge => this.challengeToDtoMapper.transform(challenge)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [UnlockDto])
  async playerUnlocks(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<UnlockDto[]> {
    const gameUnlocks: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.UNLOCK);
    const playerUnlocks: PlayerReward[] = await this.playerRewardService.findAll({
      player: { $eq: playerId },
    });
    const unlocks: Reward[] = gameUnlocks.filter(unlock1 =>
      playerUnlocks.some(unlock2 => unlock1.id === unlock2.reward),
    );
    return Promise.all(unlocks.map(async unlock => this.rewardToDtoMapper.transform(unlock)));
  }
}
