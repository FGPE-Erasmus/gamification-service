import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GameModule } from '../game/game.module';
import { EventModule } from '../event/event.module';
import { PlayerModule } from '../player/player.module';
import { UsersModule } from '../users/users.module';
import { GroupToDtoMapper } from './mappers/group-to-dto.mapper';
import { Group, GroupSchema } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import { GroupService } from './group.service';
import { GroupResolver } from './group.resolver';
import { SubscriptionsModule } from 'src/common/subscriptions/subscriptions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
    ]),
    forwardRef(() => EventModule),
    forwardRef(() => UsersModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => SubscriptionsModule),
  ],
  providers: [GroupToDtoMapper, GroupRepository, GroupService, GroupResolver],
  exports: [GroupToDtoMapper, GroupRepository, GroupService],
})
export class GroupModule {}
