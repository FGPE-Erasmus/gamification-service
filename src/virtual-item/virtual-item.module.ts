import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualItemResolver } from './virtual-item.resolver';
import { VirtualItemRepository } from './repository/virtual-item.repository';
import { VirtualItemService } from './virtual-item.service';
import { Module } from '@nestjs/common';
import { PlayerRepository } from 'src/player/repository/player.repository';

@Module({
  imports: [TypeOrmModule.forFeature([VirtualItemRepository]), TypeOrmModule.forFeature([PlayerRepository])],
  providers: [VirtualItemService, VirtualItemResolver],
  exports: [VirtualItemService],
})
export class VirtualItemModule {}
