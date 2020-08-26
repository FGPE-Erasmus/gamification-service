import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';
import { SortingOrders } from './entities/sorting.enum';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly playerLeaderboardRepository: PlayerLeaderboardRepository,
  ) {}

  async createLeaderboard(id: string | undefined, data: LeaderboardDto): Promise<Leaderboard> {
    const fields: { [key: string]: any } = { ...data };
    const newLeaderboard: Leaderboard = await this.serviceHelper.getUpsertData(id, fields, this.leaderboardRepository);
    return this.leaderboardRepository.save(newLeaderboard);
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
