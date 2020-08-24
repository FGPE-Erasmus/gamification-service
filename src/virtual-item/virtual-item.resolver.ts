import { VirtualItemService } from './virtual-item.service';
import { VirtualItemEntity as VirtualItem } from './entities/virtual-item.entity';
import { Args, Resolver, Query } from '@nestjs/graphql';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';

@Resolver()
export class VirtualItemResolver {
  constructor(readonly virtualItemService: VirtualItemService) {}

  @Query(() => [Player])
  async playersWithVirtualItem(@Args('id') id: string): Promise<any[]> {
    return await this.virtualItemService.getPlayersWithVirtualItem(id);
  }

  @Query(() => [VirtualItem])
  async virtualItem(@Args('rewardId') id: string, @GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItem(id, playerId);
  }

  @Query(() => [VirtualItem])
  async virtualItems(@GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItems(playerId);
  }
}
