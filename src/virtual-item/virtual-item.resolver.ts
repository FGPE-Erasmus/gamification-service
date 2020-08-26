import { VirtualItemService } from './virtual-item.service';
import { VirtualItemEntity as VirtualItem } from './entities/virtual-item.entity';
import { Args, Resolver, Query } from '@nestjs/graphql';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { UseGuards } from '@nestjs/common';
import { GqlJwtAuthGuard } from 'src/common/guards/gql-jwt-auth.guard';
import { GqlEnrolledInGame } from 'src/common/guards/gql-game-enrollment.guard';

@Resolver()
export class VirtualItemResolver {
  constructor(readonly virtualItemService: VirtualItemService) {}

  @Query(() => [Player])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async playersWithVirtualItem(@Args('virtualItemId') id: string): Promise<any[]> {
    return await this.virtualItemService.getPlayersWithVirtualItem(id);
  }

  @Query(() => [VirtualItem])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async virtualItems(@GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItems(playerId);
  }

  @Query(() => [VirtualItem])
  @UseGuards(GqlJwtAuthGuard, GqlEnrolledInGame)
  async virtualItem(@Args('virtualItemId') id: string, @GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItem(id, playerId);
  }
}
