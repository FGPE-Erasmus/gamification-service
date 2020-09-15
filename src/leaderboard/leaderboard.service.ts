import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';
import { SortingOrders } from './entities/sorting.enum';
import { ChallengeRepository } from 'src/challenge/repositories/challenge.repository';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly playerLeaderboardRepository: PlayerLeaderboardRepository,
    private readonly challengeRepository: ChallengeRepository,
  ) {}

  async createLeaderboard(gameId: string, data: LeaderboardDto, challengeId?: string): Promise<Leaderboard> {
    const fields: { [key: string]: any } = { ...data };
    fields.gameId = gameId;
    fields.sortingOrders = fields.sorting_orders as [SortingOrders];
    delete fields.sorting_orders;
    if (challengeId) {
      const challenge = this.challengeRepository.findOne(challengeId);
      fields.challenge = challenge;
    }
    const newLeaderboard: Leaderboard = await this.serviceHelper.getUpsertData(
      fields.id,
      fields,
      this.leaderboardRepository,
    );
    return await this.leaderboardRepository.save(newLeaderboard);
  }

  async sortLeaderboard(leaderboardId: string): Promise<any> {
    const leaderboard: Leaderboard = await this.leaderboardRepository.findOne(leaderboardId);
    const list = await this.playerLeaderboardRepository.find({
      where: {
        leaderboardId: leaderboardId,
      },
    });
    list.sort((a, b) => {
      for (let i = 0; i < leaderboard.metrics.length; i++) {
        const metric = leaderboard.metrics[i];
        const sortingOrder = leaderboard.sortingOrders[i];
        const reverse = sortingOrder === SortingOrders.DESC ? -1 : 1;
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        }
      }
      return 0;
    });
    return list;
  }
}
