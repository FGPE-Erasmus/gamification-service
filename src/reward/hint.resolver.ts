import { Args, Query, Resolver } from '@nestjs/graphql';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { HintDto } from './dto/hint.dto';
import { Reward } from './models/reward.model';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => HintDto)
export class HintResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [HintDto])
  async hints(@Args('gameId') gameId: string): Promise<HintDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.HINT);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [HintDto])
  async playerHints(
    @Args('gameId') gameId: string,
    @GqlPlayer('id') playerId: string,
    @Args('challengeId') challengeId?: string,
  ): Promise<HintDto[]> {
    let gameHints: Reward[];
    if (challengeId) {
      gameHints = await this.rewardService.findAll({
        $and: [{ game: gameId }, { parentChallenge: challengeId }],
      });
    }
    gameHints = await this.rewardService.findByGameId(gameId);
    const playerHints: PlayerReward[] = await this.playerRewardService.findAll({
      player: { $eq: playerId },
    });
    const hints: Reward[] = gameHints.filter(hint1 => playerHints.some(hint2 => hint1.id === hint2.reward));
    return Promise.all(hints.map(async hint => this.rewardToDtoMapper.transform(hint)));
  }
}
