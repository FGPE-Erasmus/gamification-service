import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ServiceHelper } from '../common/helpers/service.helper';
import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserRepository]),
    // forwardRef(() => AuthModule),
  ],
  exports: [UsersService],
  providers: [UsersService, UsersResolver, ServiceHelper],
})
export class UsersModule {}
