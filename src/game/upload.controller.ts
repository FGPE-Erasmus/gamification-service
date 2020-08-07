import { FileInterceptor } from '@nestjs/platform-express';
import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, Body } from '@nestjs/common';
import { Readable } from 'stream';

import { RestJwtGuard } from '../common/guards/rest-jwt-auth.guard';
import { RestAdminGuard } from '../common/guards/rest-admin.guard';
import GameDto from './game.dto';
import { GameService } from './game.service';

@Controller('upload')
export class GameUploadController {
  constructor(private gameService: GameService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @UseGuards(RestJwtGuard, RestAdminGuard)
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async uploadZip(@Body() gameDto: GameDto, @UploadedFile() file): Promise<string> {
    await this.gameService.create(gameDto, Readable.from(file.buffer));
    return 'Creating a game...';
  }
}
