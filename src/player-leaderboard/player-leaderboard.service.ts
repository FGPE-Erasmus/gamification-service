import { Injectable } from '@nestjs/common';
import { ServiceHelper } from '../common/helpers/service.helper';
import { PlayerLeaderboardRepository } from './repository/player-leaderboard.repository';
import { PlayerLeaderboardEntity as PlayerLeaderboard } from './entity/player-leaderboard.entity';
import PlayerLeaderboardDto from './dto/player-leaderboard.dto';

@Injectable()
export class PlayerLeaderboardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly playerleaderboardRepository: PlayerLeaderboardRepository,
  ) {}

  async createPlayerLeaderboard(data: PlayerLeaderboardDto): Promise<PlayerLeaderboard> {
    const playerLeaderboard = {
      playerId: data.playerId,
      leaderboardId: data.leaderboardId,
      score: data.score,
    };

    const newPlayerLeaderboard: PlayerLeaderboard = await this.serviceHelper.getUpsertData(
      undefined,
      { ...playerLeaderboard },
      this.playerleaderboardRepository,
    );

    return this.playerleaderboardRepository.save(newPlayerLeaderboard);
  }

  async updatePlayerLeaderboard(
    playerId: string,
    leaderboardId: string,
    metric: string,
    value: number,
  ): Promise<PlayerLeaderboard> {
    const playerLeaderboard = await this.playerleaderboardRepository.findOne({
      where: {
        playerId,
        leaderboardId,
      },
    });
    playerLeaderboard.score[metric] = value;
    return this.playerleaderboardRepository.save(playerLeaderboard);
  }
}
