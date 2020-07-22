import { Module } from '@nestjs/common';
import { GameUploadController } from './upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from 'src/users/users.module';
import { GameResolver } from './game.resolver';
import { GameService } from './game.service';

@Module({
  imports: [MulterModule, UsersModule],
  controllers: [GameUploadController],
  providers: [GameService, GameResolver],
  exports: [GameService],
})
export class GameModule {}
