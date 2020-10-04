import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ServiceHelper } from '../common/helpers/service.helper';
import { PlayerService } from './player.service';
import { Player, PlayerSchema } from './models/player.model';
import { PlayerRepository } from './repository/player.repository';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Player.name,
        useFactory: () => PlayerSchema
      }
    ]),
  ],
  providers: [ServiceHelper, PlayerRepository, PlayerService],
  exports: [PlayerService],
})
export class PlayerModule {}
