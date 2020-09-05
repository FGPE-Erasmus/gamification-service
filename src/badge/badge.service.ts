import { BadgeRepository } from './repository/badge.repository';
import { BadgeEntity as Badge } from './entities/badge.entity';
import { Injectable } from '@nestjs/common';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { getRepository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Trigger } from 'src/hook/enums/trigger.enum';
import { BadgeDto } from './dto/badge.dto';
import { ServiceHelper } from 'src/common/helpers/service.helper';

@Injectable()
export class BadgeService {
  constructor(
    @InjectQueue('hooksQueue') private hooksQueue: Queue,
    private readonly badgeRepository: BadgeRepository,
    private readonly serviceHelper: ServiceHelper,
  ) {}

  async getBadge(id: string, playerId: string): Promise<Badge[]> {
    const wrap: Badge[] = [];
    const badge = await this.badgeRepository.find({
      where: {
        id: id,
        playerId: playerId,
      },
    });
    if (badge) wrap.concat(badge);
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
      .where('badge.id = :badgeId', { badgeId: id })
      .getMany();
  }

  async grantBadge(badgeDto: BadgeDto, playerId: string): Promise<any> {
    badgeDto.playerId = playerId;
    const badge: Badge = await this.serviceHelper.getUpsertData(undefined, { ...badgeDto }, this.badgeRepository);
    await this.badgeRepository.save(badge);

    const job = await this.hooksQueue.add(Trigger.REWARD_GRANTED, {
      rewardId: badge.id,
      playerId: playerId,
    });
  }
}
