import { CouponRepository } from './repository/coupon.repository';
import { CouponEntity as Coupon } from './entities/coupon.entity';
import { PlayerRepository } from 'src/player/repository/player.repository';
import { getRepository } from 'typeorm';

export class CouponService {
  constructor(readonly couponRespository: CouponRepository) {}

  async getCoupon(id: string, playerId: string): Promise<Coupon[]> {
    const wrap: Coupon[] = [];
    const coupon = await this.couponRespository.find({
      where: {
        id: id,
        playerId: playerId,
      },
    });
    if (coupon) wrap.concat(coupon);
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
      .where('coupon.id = :couponId', { couponId: id })
      .getMany();
  }
}
