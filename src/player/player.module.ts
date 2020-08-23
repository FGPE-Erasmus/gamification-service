import { Module } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { PlayerService } from './player.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerRepository } from './repository/player.repository';

@Module({
  imports: [TypeOrmModule.forFeature([PlayerRepository])],
  providers: [ServiceHelper, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
