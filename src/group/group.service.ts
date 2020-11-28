import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { PlayerService } from '../player/player.service';
import { Group, GroupDocument } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import { Player } from '../player/models/player.model';
import { shuffleArray } from '../common/utils/array.utils';

@Injectable()
export class GroupService extends BaseService<Group, GroupDocument> {
  constructor(
    protected readonly repository: GroupRepository,
    @Inject(forwardRef(() => PlayerService)) protected readonly playerService: PlayerService,
  ) {
    super(new Logger(GroupService.name), repository);
  }

  async findByGame(gameId: string): Promise<Group[]> {
    return this.findAll({ game: { $eq: gameId } });
  }

  async findByGameAndPlayer(gameId: string, playerId: string): Promise<Group> {
    return await this.findOne({
      $and: [{ game: { $eq: gameId } }, { players: playerId }],
    });
  }

  async autoAssignPlayers(gameId: string): Promise<Group[]> {
    const groups: Group[] = shuffleArray(await this.findByGame(gameId));
    const players: Player[] = shuffleArray(await this.playerService.findByGame(gameId));
    let assigned = 0;
    for (const player of players) {
      await this.playerService.setGroup(gameId, player.id, groups[assigned++ % groups.length].id);
    }
    return await this.findByGame(gameId);
  }
}
