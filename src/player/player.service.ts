import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { EventService } from '../event/event.service';

@Injectable()
export class PlayerService extends BaseService<Player> {
  constructor(protected readonly repository: PlayerRepository, protected readonly eventService: EventService) {
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
    // is the player already enrolled?
    let player: Player = await this.findByGameAndUser(gameId, userId);
    if (player) {
      return player;
    }

    // enroll
    player = await this.create({ game: gameId, user: userId });

    // send PLAYER_ENROLLED event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_ENROLLED, {
      gameId: gameId,
      playerId: player.id,
    });

    return player;
  }
}
