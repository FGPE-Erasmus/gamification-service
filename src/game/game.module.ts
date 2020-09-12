import { Module } from '@nestjs/common';
import { GameUploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from 'src/users/users.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';
import { HookService } from 'src/hook/hook.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledHookRepository } from 'src/hook/repository/scheduled-hook.repository';
import { ActionHookRepository } from 'src/hook/repository/action-hook.repository';

@Module({
  imports: [MulterModule, UsersModule, TypeOrmModule.forFeature([ScheduledHookRepository, ActionHookRepository])],
  controllers: [GameUploadController],
  providers: [GameService, GameResolver, HookService],
  exports: [GameService],
})
export class GameModule {}
