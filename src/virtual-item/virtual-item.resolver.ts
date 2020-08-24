import { VirtualItemService } from './virtual-item.service';
import { VirtualItemEntity as VirtualItem } from './entities/virtual-item.entity';
import { Args, Resolver, Query } from '@nestjs/graphql';
import { GqlUser } from 'src/common/decorators/gql-user.decorator';

@Resolver()
export class VirtualItemResolver {
  constructor(readonly virtualItemService: VirtualItemService) {}

  @Query(() => [VirtualItem])
  async virtualItem(@Args('rewardId') id: string, @GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItem(id, playerId);
  }

  @Query(() => [VirtualItem])
  async virtualItems(@GqlUser('id') playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemService.getVirtualItems(playerId);
  }

  // @Query(() => [Player])
  // async playersWithVirtualItem(@Args('id') id: string): Promise<Player[]> {
  //     return await this.virtualItemService.getPlayersWithVirtualItem(id);
  // }
}
