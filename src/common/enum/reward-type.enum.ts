import { registerEnumType } from '@nestjs/graphql';

export enum RewardType {
  BADGE = 'badge',
  COUPON = 'coupon',
  HINT = 'hint',
  VIRTUAL_ITEM = 'virtual item',
}

registerEnumType(RewardType, { name: 'RewardType' });
