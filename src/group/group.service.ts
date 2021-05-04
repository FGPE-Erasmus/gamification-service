import { BadRequestException, forwardRef, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { PlayerService } from '../player/player.service';
import { Group, GroupDocument } from './models/group.model';
import { GroupRepository } from './repositories/group.repository';
import { Player } from '../player/models/player.model';
import { shuffleArray } from '../common/utils/array.utils';
import { TokenDto } from '../common/dto/token.dto';
import { Game } from '../game/models/game.model';
import { createToken, verifyToken } from '../common/services/jwt.service';
import { appConfig } from '../app.config';
import { GameService } from '../game/game.service';

@Injectable()
export class GroupService extends BaseService<Group, GroupDocument> {
  constructor(
    protected readonly repository: GroupRepository,
    @Inject(forwardRef(() => GameService)) protected readonly gameService: GameService,
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

  /**
   * Generate token to add player automatically into a group.
   *
   * @param {string} gameId ID of the game.
   * @param {string} groupId ID of the group.
   */
  async generateGroupToken(gameId: string, groupId: string): Promise<TokenDto> {
    const game: Game = await this.gameService.findById(gameId);
    if (!game) {
      throw new NotFoundException();
    }
    const group: Group = await this.findById(groupId);
    if (!group) {
      throw new NotFoundException();
    }
    const token = createToken(
      { groupId: group.id },
      appConfig.generatedTokens.timeout,
      appConfig.generatedTokens.secret,
      appConfig.host,
      appConfig.uuid,
    );
    return {
      token,
      expiresIn: appConfig.generatedTokens.timeout,
    };
  }

  /**
   * Verify token to add automatically in game.
   *
   * @param token the token
   */
  async verifyGroupToken(token: string): Promise<{ [k: string]: any }> {
    const payload = await verifyToken(token, appConfig.generatedTokens.secret);
    if (!payload.groupId) {
      throw new BadRequestException('Not a token for adding a player into a group');
    }
    return payload;
  }
}
