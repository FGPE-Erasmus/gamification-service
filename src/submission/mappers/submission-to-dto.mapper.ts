import { Injectable } from '@nestjs/common';

import { IMapper } from '../../common/interfaces/mapper.interface';
import { PlayerToDtoMapper } from '../../player/mappers/player-to-dto.mapper';
import { PlayerService } from '../../player/player.service';
import { Submission } from '../models/submission.model';
import { SubmissionDto } from '../dto/submission.dto';
import { GameService } from '../../game/game.service';
import { classToPlain, plainToClass } from 'class-transformer';
import { PlayerDto } from '../../player/dto/player.dto';


@Injectable()
export class SubmissionToDtoMapper implements IMapper<Submission, SubmissionDto> {

  constructor(
    protected readonly gameService: GameService,
    protected readonly playerService: PlayerService,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
  ) {
  }

  async transform(obj: Submission, resolve: (keyof Submission)[] = []): Promise<SubmissionDto> {
    return plainToClass(SubmissionDto, classToPlain(obj, { excludeExtraneousValues: true }));
  }

  async resolveGame(): Promise<PlayerDto> {
    return undefined
  }

  async resolvePlayer(): Promise<PlayerDto> {
    return undefined
  }

}
