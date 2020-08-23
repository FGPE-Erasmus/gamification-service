import { EntityRepository, Repository } from 'typeorm';
import { LeaderboardEntity as Leaderboard } from '../entities/leaderboard.entity';

@EntityRepository(Leaderboard)
export class LeaderboardRepository extends Repository<Leaderboard> {}
