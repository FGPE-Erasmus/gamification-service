import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { GameJwtAuthGuard } from './game-jwt-auth';
import { GameAdminGuard } from './game-admin.guard';


@Controller('upload')
@UseGuards(GameJwtAuthGuard, GameAdminGuard)
export class GameUploadController {
    @Post()
    @UseInterceptors(FileInterceptor('zip'))
    createGame(@UploadedFile() file) {
        return { file };
    }
}