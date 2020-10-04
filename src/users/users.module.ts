import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { User, UserSchema } from './models/user.model';
import { UserRepository } from './repositories/user.repository';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import { UserToPersistenceMapper } from './mappers/user-to-persistence.mapper';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: User.name,
        useFactory: () => UserSchema
      }
    ]),
  ],
  providers: [
    UserToDtoMapper,
    UserToPersistenceMapper,
    UserRepository,
    UsersService,
    UsersResolver
  ],
  exports: [ UsersService ],
})
export class UsersModule {
}
