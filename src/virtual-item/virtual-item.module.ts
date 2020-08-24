import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualItemResolver } from './virtual-item.resolver';
import { VirtualItemRepository } from './repository/virtual-item.repository';
import { VirtualItemService } from './virtual-item.service';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([VirtualItemRepository])],
  providers: [VirtualItemService, VirtualItemResolver],
  exports: [VirtualItemService],
})
export class VirtualItemModule {}
