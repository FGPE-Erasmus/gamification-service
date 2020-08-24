import { BadgeRepository } from './repository/badge.repository';
import { BadgeEntity as Badge } from './entities/badge.entity';
import { Injectable } from '@nestjs/common';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { getRepository } from 'typeorm';

@Injectable()
export class BadgeService {
  constructor(readonly badgeRepository: BadgeRepository) {}

  async getBadge(id: string, playerId: string): Promise<Badge[]> {
    const wrap: Badge[] = [];
    const badge = await this.badgeRepository.findOne({
      where: {
        id: id,
        playerId: playerId,
      },
    });
    if (badge) wrap.push(badge);
    return wrap;
  }

  async getBadges(playerId: string): Promise<Badge[]> {
    return await this.badgeRepository.find({
      where: {
        playerId: playerId,
      },
    });
  }

  async getPlayersWithBadge(id: string): Promise<any[]> {
    return await getRepository(PlayerRepository)
      .createQueryBuilder('player')
      .leftJoin(BadgeRepository, 'badge', 'badge.playerId = player.id')
      .where('badge.id = :rewardId', { rewardId: id })
      .getMany();
  }
}
