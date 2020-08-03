import { Module } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { PlayerService } from './player.service';

@Module({
  providers: [ServiceHelper, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
