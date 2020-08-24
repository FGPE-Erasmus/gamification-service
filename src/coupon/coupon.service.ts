import { CouponRepository } from './repository/coupon.repository';
import { CouponEntity as Coupon } from './entities/coupon.entity';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { PlayerEntity as Player } from 'src/player/entities/player.entity';
import { getRepository } from 'typeorm';
import { BadgeRepository } from 'src/badge/repository/badge.repository';
import { CouponResolver } from './coupon.resolver';

export class CouponService {
  constructor(readonly couponRespository: CouponRepository) {}

  async getCoupon(id: string, playerId: string): Promise<Coupon[]> {
    const wrap: Coupon[] = [];
    const coupon = await this.couponRespository.findOne({
      where: {
        id: id,
        playerId: playerId,
      },
    });
    if (coupon) wrap.push(coupon);
    return wrap;
  }

  async getCoupons(playerId: string): Promise<Coupon[]> {
    return await this.couponRespository.find({
      where: {
        playerId: playerId,
      },
    });
  }

  async getPlayersWithCoupon(id: string): Promise<any[]> {
    return await getRepository(PlayerRepository)
      .createQueryBuilder('player')
      .leftJoin(CouponRepository, 'coupon', 'coupon.playerId = player.id')
      .where('coupon.id = :rewardId', { rewardId: id })
      .getMany();
  }
}
