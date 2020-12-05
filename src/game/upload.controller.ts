import { FileInterceptor } from '@nestjs/platform-express';
import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Readable } from 'stream';
import 'multer';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { GameInput } from './inputs/game.input';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';

@Controller('upload')
export class GameUploadController {
  constructor(private gameService: GameService) {}

  @Roles(Role.AUTHOR)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async importGEdILArchive(@Body() gameDto: GameInput, @UploadedFile() file: Express.Multer.File): Promise<GameDto> {
    return this.gameService.importGEdILArchive(gameDto, {
      filename: file.filename,
      encoding: file.encoding as BufferEncoding,
      mimetype: file.mimetype,
      content: Readable.from(file.buffer),
    });
  }
}
