import { EntityRepository, Repository } from 'typeorm';

import { PlayerLeaderboardEntity as PlayerLeaderboard } from '../entities/player-leaderboard.entity';

@EntityRepository(PlayerLeaderboard)
export class PlayerLeaderboardRepository extends Repository<PlayerLeaderboard> {}
