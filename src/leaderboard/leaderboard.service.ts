import { Injectable, LoggerService } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { GameDto } from '../game/dto/game.dto';
import { Leaderboard } from './models/leaderboard.model';
import { LeaderboardRepository } from './repository/leaderboard.repository';
import { LeaderboardInput } from './inputs/leaderboard.input';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaderboardToDtoMapper } from './mappers/leaderboard-to-dto.mapper';
import { LeaderboardToPersistenceMapper } from './mappers/leaderboard-to-persistence.mapper';
import { RankingDto } from './dto/ranking.dto';
import { ChallengeDto } from '../challenge/dto/challenge.dto';

@Injectable()
export class LeaderboardService extends BaseService<Leaderboard, LeaderboardInput, LeaderboardDto> {

  constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: LeaderboardRepository,
    protected readonly toDtoMapper: LeaderboardToDtoMapper,
    protected readonly toPersistenceMapper: LeaderboardToPersistenceMapper,
  ) {
    super(logger, repository, toDtoMapper, toPersistenceMapper);
  }

  async importGEdIL(
    game: GameDto,
    entries: { [path: string]: Buffer },
    challenge?: ChallengeDto
  ): Promise<LeaderboardDto> {
    let leaderboard: LeaderboardDto;
    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      leaderboard = await this.create({
        ...encodedContent,
        game: game.id,
        parentChallenge: challenge?.id,
      });
    }
    return leaderboard;
  }

  // TODO instead of maintaining & updating scores in a collection,
  // calculate rankings on-demand

  async getRankings(leaderboardId: string): Promise<RankingDto[]> {
    return [];
  }

  /*async sortLeaderboard(leaderboardId: string): Promise<any> {
    const leaderboard: Leaderboard = await this.findById(leaderboardId);
    const list = await this.playerLeaderboardRepository.find({
      where: {
        leaderboardId: leaderboardId,
      },
    });
    list.sort((a, b) => {
      for (let i = 0; i < leaderboard.metrics.length; i++) {
        const metric = leaderboard.metrics[i];
        const sortingOrder = leaderboard.sortingOrders[i];
        const reverse = sortingOrder === SortingOrder.DESC ? -1 : 1;
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        }
      }
      return 0;
    });
    return list;
  }*/

  /*async sortPlayers(players: PlayerDto[], metrics: string[]): Promise<PlayerDto[]> {
    const submissionss = players.
    players.sort((a, b) => {
      for (let i = 0; i < leaderboard.metrics.length; i++) {
        const metric = leaderboard.metrics[i];
        const sortingOrder = leaderboard.sortingOrders[i];
        const reverse = sortingOrder === SortingOrder.DESC ? -1 : 1;
        if (a.score[metric] < b.score[metric]) {
          return reverse * -1;
        } else if (a.score[metric] > b.score[metric]) {
          return reverse * 1;
        }
      }
      return 0;
    });
  }*/
}
