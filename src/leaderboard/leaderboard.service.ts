import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardRepository } from './leaderboard.repository';
import { LeaderboardDto } from './leaderboard.dto';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';
import { SortedResult } from './entities/sorted-result.dto';
import { SortingOrders } from './entities/sorting.enum';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly playerLeaderboardRepository: PlayerLeaderboardRepository,
  ) {}

  async createLeaderboard(id: string | undefined, data: LeaderboardDto): Promise<Leaderboard> {
    const fields: { [l: string]: any } = { ...data };
    const newLeaderboard: Leaderboard = await this.serviceHelper.getUpsertData(id, fields, this.leaderboardRepository);
    return this.leaderboardRepository.save(newLeaderboard);
  }

  async sortLeaderboard(
    leaderboardId: string,
    leaderboardName: string,
    metrics: string[],
    sortingOrder: SortingOrders[],
    index: number,
  ): Promise<SortedResult> {
    const tempList = await this.playerLeaderboardRepository.find({
      where: {
        leaderboardId: leaderboardId,
      },
    });

    if (sortingOrder[index].includes(SortingOrders.ASC)) {
      tempList.sort((x, y) => (x.score[metrics[index]] > y.score[metrics[index]] ? -1 : 1));
    }
    if (sortingOrder[index].includes(SortingOrders.DESC)) {
      tempList.sort((x, y) => (x.score[metrics[index]] > y.score[metrics[index]] ? 1 : -1));
    }

    const tempScores = [];

    for (const player of tempList) {
      tempScores.push(player.score[metrics[index]]);
    }

    if (this.hasDuplicates(tempScores)) {
      return this.sortLeaderboard(leaderboardId, leaderboardName, metrics, sortingOrder, index + 1);
    } else {
      const result: SortedResult = {
        name: leaderboardName,
        entries: tempList,
      };
      return result;
    }
  }

  hasDuplicates<T>(arr: T[]): boolean {
    return new Set(arr).size < arr.length;
  }
}
