import { Module } from '@nestjs/common';
import { GameUploadController } from './game.upload.controller';
import { MulterModule } from '@nestjs/platform-express';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [MulterModule, UsersModule],
    controllers: [GameUploadController],
})
export class GameModule { }
