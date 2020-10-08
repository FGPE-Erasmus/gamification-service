import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';

@Injectable()
export class PlayerService extends BaseService<Player> {
  constructor(protected readonly repository: PlayerRepository) {
    super(new Logger(PlayerService.name), repository);
  }

  findByGame(gameId: string): Promise<Player[]> {
    return this.findAll({ game: { $eq: gameId } });
  }

  findByGameAndUser(gameId: string, userId: string): Promise<Player> {
    return this.findOne({
      game: { $eq: gameId },
      user: { $eq: userId },
    });
  }
}
