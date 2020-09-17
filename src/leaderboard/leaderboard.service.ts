import { Injectable } from '@nestjs/common';

import { ServiceHelper } from 'src/common/helpers/service.helper';
import { extractToJson } from 'src/common/utils/extraction.utils';
import { SortingOrders } from './entities/sorting.enum';
import { GameEntity as Game } from '../game/entities/game.entity';
import { ChallengeEntity as Challenge } from '../challenge/entities/challenge.entity';
import { LeaderboardEntity as Leaderboard } from './entities/leaderboard.entity';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { PlayerLeaderboardRepository } from 'src/player-leaderboard/repository/player-leaderboard.repository';

@Injectable()
export class LeaderboardService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly leaderboardRepository: LeaderboardRepository,
    private readonly playerLeaderboardRepository: PlayerLeaderboardRepository,
  ) {}

  async importGEdIL(
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Leaderboard | undefined> {
    let leaderboard: Leaderboard;

    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      leaderboard = await this.createLeaderboard({
        ...encodedContent,
        gameId: game.id,
        challenge,
      });
    }
    return leaderboard;
  }

  async createLeaderboard(data: LeaderboardDto): Promise<Leaderboard> {
    const fields: { [key: string]: any } = { ...data };
    fields.sortingOrders = fields.sorting_orders as [SortingOrders];
    delete fields.sorting_orders;
    const newLeaderboard: Leaderboard = await this.serviceHelper.getUpsertData(
      null,
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
