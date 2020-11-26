import { registerEnumType } from '@nestjs/graphql';

export enum NotificationEnum {
  REWARD_RECEIVED = 'REWARD_RECEIVED',
  REWARD_SUBSTRACTED = 'REWARD_SUBSTRACTED',
  REWARD_REMOVED = 'REWARD_REMOVED',
  POINTS_UPDATED = 'POINTS_UPDATED',
  PLAYER_ENROLLED = 'PLAYER_ENROLLED',
  CHALLENGE_STATUS_UPDATED = 'CHALLENGE_STATUS_UPDATED',
  SUBMISSION_SENT = 'SUBMISSION_SENT',
  SUBMISSION_EVALUATED = 'SUBMISSION_EVALUATED',
}

registerEnumType(NotificationEnum, { name: 'NotificationEnum' });
