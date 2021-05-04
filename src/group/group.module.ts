import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameModule } from '../game/game.module';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';
import { GroupToDtoMapper } from './mappers/group-to-dto.mapper';
import { GroupSchema } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { GroupTokenResolver } from './group-token.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'Group',
        schema: GroupSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
  ],
  providers: [GroupToDtoMapper, GroupRepository, GroupService, GroupResolver, GroupTokenResolver],
  exports: [GroupToDtoMapper, GroupRepository, GroupService],
})
export class GroupModule {}
