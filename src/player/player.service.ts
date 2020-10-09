import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';

@Injectable()
export class PlayerService extends BaseService<Player> {
  constructor(protected readonly repository: PlayerRepository) {
    super(new Logger(PlayerService.name), repository);
  }

  async findByGame(gameId: string): Promise<Player[]> {
    return this.findAll({ game: { $eq: gameId } });
  }

  async findByGameAndUser(gameId: string, userId: string): Promise<Player> {
    return await this.findOne({
      $and: [{ user: { $eq: userId } }, { game: { $eq: gameId } }],
    });
  }

  async enroll(gameId: string, userId: string): Promise<Player> {
    const player: Player = await this.findByGameAndUser(gameId, userId);
    if (player) {
      return player;
    }
    const newPlayer: Player = await this.create({ game: gameId, user: userId });
    this.logger.error(newPlayer);
    return newPlayer;
  }

  async getGamePlayers(gameId: string): Promise<Player[]> {
    return this.playerRepository.find({
      where: {
        gameId: gameId,
      },
    });
  }

  async getPlayer(playerId: string): Promise<Player> {
    return this.playerRepository.findOne(playerId);
  }
}
