import { Args, Query, Resolver } from '@nestjs/graphql';

import { PointDto } from './dto/point.dto';
import { RewardType } from './models/reward-type.enum';
import { RewardResolver } from './reward.resolver';
import { Reward } from './models/reward.model';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { UseGuards } from '@nestjs/common';
import { GqlInstructorAssignedGuard } from '../common/guards/gql-instructor-assigned.guard';
import { GqlPlayerOfGuard } from '../common/guards/gql-player-of.guard';
import { GqlPlayer } from '../common/decorators/gql-player.decorator';
import { PlayerReward } from '../player-reward/models/player-reward.model';

@Resolver(() => PointDto)
export class PointResolver extends RewardResolver {
  @Roles(Role.AUTHOR, Role.TEACHER, Role.STUDENT)
  @UseGuards(GqlInstructorAssignedGuard, GqlPlayerOfGuard)
  @Query(() => [PointDto])
  async points(@Args('gameId') gameId: string): Promise<PointDto[]> {
    const rewards: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.POINT);
    return Promise.all(rewards.map(async reward => this.rewardToDtoMapper.transform(reward)));
  }

  @Roles(Role.STUDENT)
  @UseGuards(GqlPlayerOfGuard)
  @Query(() => [PointDto])
  async playerPoints(@Args('gameId') gameId: string, @GqlPlayer('id') playerId: string): Promise<PointDto[]> {
    const gamePoints: Reward[] = await this.rewardService.findByGameId(gameId, RewardType.POINT);
    const playerPoints: PlayerReward[] = await this.playerRewardService.findAll({
      player: { $eq: playerId },
    });
    const points: Reward[] = gamePoints.filter(point1 => playerPoints.some(point2 => point1.id === point2.reward));
    return Promise.all(points.map(async point => this.rewardToDtoMapper.transform(point)));
  }
}
