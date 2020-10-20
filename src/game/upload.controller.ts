import { FileInterceptor } from '@nestjs/platform-express';
import { Body, Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { Readable } from 'stream';
import 'multer';

import { RestJwtGuard } from '../common/guards/rest-jwt-auth.guard';
import { RestAdminGuard } from '../common/guards/rest-admin.guard';
import { GameInput } from './inputs/game.input';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';

@Controller('upload')
export class GameUploadController {
  constructor(private gameService: GameService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RestJwtGuard, RestAdminGuard)
  async importGEdILArchive(@Body() gameDto: GameInput, @UploadedFile() file: Express.Multer.File): Promise<GameDto> {
    return this.gameService.importGEdILArchive(gameDto, {
      filename: file.filename,
      encoding: file.encoding as BufferEncoding,
      mimetype: file.mimetype,
      content: Readable.from(file.buffer),
    });
  }
}
