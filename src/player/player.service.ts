import { Injectable, Logger, LoggerService } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from './models/player.model';
import { PlayerInput } from './inputs/player.input';
import { PlayerDto } from './dto/player.dto';
import { PlayerRepository } from './repositories/player.repository';
import { PlayerToDtoMapper } from './mappers/player-to-dto.mapper';
import { PlayerToPersistenceMapper } from './mappers/player-to-persistence.mapper';

@Injectable()
export class PlayerService extends BaseService<Player, PlayerInput, PlayerDto> {
  constructor(
    protected readonly repository: PlayerRepository,
    protected readonly toDtoMapper: PlayerToDtoMapper,
    protected readonly toPersistenceMapper: PlayerToPersistenceMapper,
  ) {
    super(new Logger(PlayerService.name), repository, toDtoMapper, toPersistenceMapper);
  }

  findByGame(gameId: string): Promise<PlayerDto[]> {
    return this.findAll({ game: gameId });
  }

  findByGameAndUser(gameId: string, userId: string): Promise<PlayerDto> {
    return this.findOne({ game: gameId, user: userId });
  }
}
