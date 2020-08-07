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
    const fields: { [l: string]: any } = { ...data };
    const newLeaderboard: Leaderboard = await this.serviceHelper.getUpsertData(id, fields, this.leaderboardRepository);
    return this.leaderboardRepository.save(newLeaderboard);
  }

  async sortLeaderboard(leaderboardId: string): Promise<any> {
    let temp = 0;
    let start = 0;
    let end = 0;
    let duplicatesIndex = 0;
    let preSorted = [];
    let postSorted = [];

    const leaderboard: Leaderboard = await this.leaderboardRepository.findOne(leaderboardId);
    let list = await this.playerLeaderboardRepository.find({
      where: {
        leaderboardId: leaderboardId,
      },
    });

    for (let i = 0; i < leaderboard.metrics.length; i++) {
      let outcome = 1;
      const metric = leaderboard.metrics[i];
      const sortingOrder = leaderboard.sortingOrders[i];
      const reverse = sortingOrder === SortingOrders.DESC ? -1 : 1;

      list.sort((a, b) => {
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        } else {
          temp = a.score[metric];
          duplicatesIndex++;
          outcome = 0;
          return outcome;
        }
      });

      if (preSorted.length !== 0 && postSorted.length === 0) {
        list.push(...preSorted.concat(list));
        preSorted = [];
      } else if (postSorted.length !== 0 && preSorted.length === 0) {
        list.push(...list.concat(postSorted));
        postSorted = [];
      } else if (postSorted.length !== 0 && preSorted.length !== 0) {
        list = preSorted.concat(list).concat(postSorted);
        postSorted = [];
        preSorted = [];
      }

      if (duplicatesIndex === 0) {
        break;
      }

      if (duplicatesIndex !== 0) {
        const tempIndex = list.reverse().findIndex(element => element.score[metric] === temp);
        start = list.reverse().findIndex(element => element.score[metric] === temp);
        preSorted = list.slice(0, start);
        end = list.length - tempIndex;
        postSorted = list.slice(end);
        duplicatesIndex = 0;
        list = list.slice(start, end);
      }
    }
    return list;
  }
}
