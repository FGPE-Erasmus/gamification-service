import { FileInterceptor } from '@nestjs/platform-express';
import { Body, Controller, Headers, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { Readable } from 'stream';
import 'multer';

import { Role } from '../common/enums/role.enum';
import { Roles } from '../keycloak/decorators/roles.decorator';
import { GameInput } from './inputs/game.input';
import { GameService } from './game.service';
import { GameDto } from './dto/game.dto';
import { GameToDtoMapper } from './mappers/game-to-dto.mapper';

@Controller('upload')
export class GameUploadController {
  constructor(private readonly gameService: GameService, protected readonly gameToDtoMapper: GameToDtoMapper) {}

  @Roles(Role.TEACHER)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async importGEdILArchive(
    @Body() gameDto: GameInput,
    @Headers() headers,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GameDto> {
    const teacherId = headers.req.userInfo.sub;
    return this.gameToDtoMapper.transform(
      await this.gameService.importGEdILArchive(
        gameDto,
        {
          filename: file.filename,
          encoding: file.encoding as BufferEncoding,
          mimetype: file.mimetype,
          content: Readable.from(file.buffer),
        },
        teacherId,
      ),
    );
  }
}
