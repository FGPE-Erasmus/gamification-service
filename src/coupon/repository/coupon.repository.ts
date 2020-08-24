import { EntityRepository, Repository } from 'typeorm';
import { CouponEntity as Coupon } from '../entities/coupon.entity';

@EntityRepository(Coupon)
export class CouponRepository extends Repository<Coupon> {}
