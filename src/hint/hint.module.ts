import { TypeOrmModule } from '@nestjs/typeorm';
import { HintService } from './hint.service';
import { HintRepository } from './repository/hint.repository';
import { HintResolver } from './hint.resolver';
import { Module } from '@nestjs/common';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([HintRepository]), TypeOrmModule.forFeature([PlayerRepository]), UsersModule],
  providers: [HintService, HintResolver],
  exports: [HintService],
})
export class HintModule {}
