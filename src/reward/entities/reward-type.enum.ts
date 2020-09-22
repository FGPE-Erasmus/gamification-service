import { registerEnumType } from '@nestjs/graphql';

export enum RewardType {
  POINT = 'POINT',
  BADGE = 'BADGE',
  VIRTUAL_ITEM = 'VIRTUAL_ITEM',
  COUPON = 'COUPON',
  REVEAL = 'REVEAL',
  UNLOCK = 'UNLOCK',
  HINT = 'HINT',
  MESSAGE = 'MESSAGE',
}

registerEnumType(RewardType, { name: 'RewardType' });
