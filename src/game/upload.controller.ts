import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import { Readable } from 'stream';
import 'multer';

import { RestJwtGuard } from '../common/guards/rest-jwt-auth.guard';
import { RestAdminGuard } from '../common/guards/rest-admin.guard';
import GameDto from './dto/game.dto';
import { GameService } from './game.service';
import { GameEntity as Game } from './entities/game.entity';

@Controller('upload')
export class GameUploadController {
  constructor(private gameService: GameService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RestJwtGuard, RestAdminGuard)
  async importGEdILArchive(@Body() gameDto: GameDto, @UploadedFile() file: Express.Multer.File): Promise<Game> {
    const game: Game = await this.gameService.importGEdILArchive(gameDto, Readable.from(file.buffer));
    return game;
  }
}
