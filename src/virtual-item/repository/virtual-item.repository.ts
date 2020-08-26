import { EntityRepository, Repository } from 'typeorm';
import { VirtualItemEntity as VirtualItem } from '../entities/virtual-item.entity';

@EntityRepository(VirtualItem)
export class VirtualItemRepository extends Repository<VirtualItem> {}
