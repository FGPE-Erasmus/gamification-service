import { forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { Player, PlayerDocument } from './models/player.model';
import { PlayerRepository } from './repositories/player.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { EventService } from '../event/event.service';
import { Group } from '../group/models/group.model';
import { GroupService } from '../group/group.service';
import { GameService } from '../game/game.service';

@Injectable()
export class PlayerService extends BaseService<Player, PlayerDocument> {
  constructor(
    protected readonly repository: PlayerRepository,
    protected readonly eventService: EventService,
    protected readonly gameService: GameService,
    @Inject(forwardRef(() => GroupService)) protected readonly groupService: GroupService,
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

  async findByUser(userId: string): Promise<Player[]> {
    return await this.findAll({
      user: { $eq: userId },
    });
  }

  async enroll(gameId: string, userId: string): Promise<Player> {
    // is the player already enrolled?
    let player: Player = await this.findByGameAndUser(gameId, userId);
    if (player) return player;

    // is the game private?
    const game = await this.gameService.findById(gameId);
    if (game.private) throw new Error('The private game cannot be accessed.');

    // enroll
    player = await this.create({ game: gameId, user: userId });

    // send PLAYER_ENROLLED event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_ENROLLED, {
      gameId: gameId,
      playerId: player.id,
    });

    return player;
  }

  async removeFromGame(gameId: string, userId: string): Promise<Player> {
    // is the player enrolled?
    let player: Player = await this.findByGameAndUser(gameId, userId);
    if (!player) {
      throw new NotFoundException();
    }

    // remove player
    player = await this.delete(player.id);

    // send PLAYER_LEFT event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_LEFT, {
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
