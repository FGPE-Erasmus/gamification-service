import { VirtualItemRepository } from './repository/virtual-item.repository';
import { VirtualItemEntity as VirtualItem } from './entities/virtual-item.entity';
import { getRepository } from 'typeorm';
import { PlayerRepository } from 'src/player/repository/player.repository';

export class VirtualItemService {
  constructor(readonly virtualItemRespository: VirtualItemRepository) {}

  async getVirtualItem(id: string, playerId: string): Promise<VirtualItem[]> {
    const wrap: VirtualItem[] = [];
    const virtualItem = await this.virtualItemRespository.findOne({
      where: {
        id: id,
        playerId: playerId,
      },
    });
    if (virtualItem) wrap.push(virtualItem);
    return wrap;
  }

  async getVirtualItems(playerId: string): Promise<VirtualItem[]> {
    return await this.virtualItemRespository.find({
      where: {
        playerId: playerId,
      },
    });
  }

  async getPlayersWithVirtualItem(id: string): Promise<any[]> {
    return await getRepository(PlayerRepository)
      .createQueryBuilder('player')
      .leftJoin(VirtualItemRepository, 'virtual_item', 'virtual_item.playerId = player.id')
      .where('virtual_item.id = :rewardId', { rewardId: id })
      .getMany();
  }
}
