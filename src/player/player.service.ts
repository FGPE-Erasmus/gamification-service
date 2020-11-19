import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { EventService } from '../event/event.service';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';

@Injectable()
export class PlayerService extends BaseService<Player> {
  constructor(
    protected readonly repository: PlayerRepository,
    protected readonly eventService: EventService,
    protected readonly groupService: GroupService,
  ) {
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

  async setGroup(gameId: string, playerId: string, groupId: string): Promise<Player> {
    // is the player enrolled?
    const player: Player = await this.findOne({
      _id: { $eq: playerId },
      game: { $eq: gameId },
    });
    if (!player) {
      throw new NotFoundException();
    }

    // does the group exist?
    const group: Group = await this.groupService.findOne({
      _id: { $eq: groupId },
      game: { $eq: gameId },
    });
    if (!group) {
      throw new NotFoundException();
    }

    return await this.patch(playerId, { group: groupId });
  }
}
