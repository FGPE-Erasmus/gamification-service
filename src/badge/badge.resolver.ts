import { Resolver, Args } from '@nestjs/graphql';
import { BadgeService } from './badge.service';
import { Query } from '@nestjs/graphql';
import { BadgeEntity as Badge } from './entities/badge.entity';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';

@Resolver()
export class BadgeResolver {
  constructor(readonly badgeService: BadgeService) {}

  @Query(() => [Player])
  @UseGuards(GqlJwtAuthGuard)
  async playersWithBadge(@Args('rewardId') id: string): Promise<Player[]> {
    return await this.badgeService.getPlayersWithBadge(id);
  }

  @Query(() => [Badge])
  @UseGuards(GqlJwtAuthGuard)
  async badges(@GqlUser('id') playerId: string): Promise<Badge[]> {
    return await this.badgeService.getBadges(playerId);
  }

  @Query(() => [Badge])
  @UseGuards(GqlJwtAuthGuard)
  async badge(@Args('rewardId') id: string, @GqlUser('id') playerId: string): Promise<Badge[]> {
    return await this.badgeService.getBadge(id, playerId);
  }
}
