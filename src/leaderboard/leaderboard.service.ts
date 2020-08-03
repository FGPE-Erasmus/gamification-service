import { Injectable } from '@nestjs/common';
import { ServiceHelper } from 'src/common/helpers/service.helper';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';
import { SortedResult } from './dto/sorted-result.dto';
import { SortingOrders } from './entities/sorting.enum';
import { PlayerLeaderboardEntity as PlayerLeaderboard } from 'src/player-leaderboard/entity/player-leaderboard.entity';

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
    list: PlayerLeaderboard[] | undefined,
  ): Promise<SortedResult> {
    if (list === undefined) {
      const list = await this.playerLeaderboardRepository.find({
        where: {
          leaderboardId: leaderboardId,
        },
      });
    }

    if (sortingOrder[index].includes(SortingOrders.ASC)) {
      list.sort((x, y) => (x.score[metrics[index]] > y.score[metrics[index]] ? -1 : 1));
    }
    if (sortingOrder[index].includes(SortingOrders.DESC)) {
      list.sort((x, y) => (x.score[metrics[index]] > y.score[metrics[index]] ? 1 : -1));
    }

    const tempScores = [];

    for (const player of list) {
      tempScores.push(player.score[metrics[index]]);
    }

    if (this.hasDuplicates(tempScores)) {
      return this.sortLeaderboard(leaderboardId, leaderboardName, metrics, sortingOrder, index + 1, list);
    } else {
      const result: SortedResult = {
        name: leaderboardName,
        entries: list,
      };
      return result;
    }
  }

  hasDuplicates<T>(arr: T[]): boolean {
    return new Set(arr).size < arr.length;
  }
}
