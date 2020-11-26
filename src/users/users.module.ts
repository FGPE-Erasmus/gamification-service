import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { UserToPersistenceMapper } from './mappers/user-to-persistence.mapper';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    forwardRef(() => PlayerModule),
  ],
  providers: [UserToDtoMapper, UserToPersistenceMapper, UserRepository, UsersService, UsersResolver],
  exports: [UserToDtoMapper, UserToPersistenceMapper, UserRepository, UsersService],
})
export class UsersModule {}
