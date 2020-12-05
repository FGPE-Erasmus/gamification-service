import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { PlayerModule } from '../player/player.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'User',
        schema: UserSchema,
      },
    ]),
    forwardRef(() => PlayerModule),
  ],
  providers: [UserToDtoMapper, UserRepository, UsersService, UsersResolver],
  exports: [UserToDtoMapper, UserRepository, UsersService],
})
export class UsersModule {}
