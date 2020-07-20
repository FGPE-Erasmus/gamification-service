import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import { RestJwtGuard } from '../common/guards/rest-jwt-auth.guard';
import { RestAdminGuard } from '../common/guards/rest-admin.guard';
import GameDto from './game.dto';


@Controller('upload')
@UseGuards(RestJwtGuard, RestAdminGuard)
export class GameUploadController {
    @Post()
    @UseInterceptors(FileInterceptor('zip'))
    uploadZip(@Body() gameDto: GameDto, @UploadedFile() file) {
        return { file };
    }
}