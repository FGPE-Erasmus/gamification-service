import { registerEnumType } from '@nestjs/graphql/dist';

export enum TriggerEventEnum {
  SUBMISSION_EVALUATED = 'SUBMISSION_EVALUATED',
  SUBMISSION_RECEIVED = 'SUBMISSION_RECEIVED',
  SUBMISSION_ACCEPTED = 'SUBMISSION_ACCEPTED',
  SUBMISSION_REJECTED = 'SUBMISSION_REJECTED',
  CHALLENGE_AVAILABLE = 'CHALLENGE_AVAILABLE',
  CHALLENGE_OPENED = 'CHALLENGE_OPENED',
  CHALLENGE_HIDDEN = 'CHALLENGE_HIDDEN',
  CHALLENGE_LOCKED = 'CHALLENGE_LOCKED',
  CHALLENGE_REJECTED = 'CHALLENGE_REJECTED',
  CHALLENGE_COMPLETED = 'CHALLENGE_COMPLETED',
  CHALLENGE_FAILED = 'CHALLENGE_FAILED',
  REWARD_GRANTED = 'REWARD_GRANTED',
  PLAYER_ENROLLED = 'PLAYER_ENROLLED',
  PLAYER_LEFT = 'PLAYER_LEFT',
  PLAYER_UPDATED = 'PLAYER_UPDATED',
  POINTS_UPDATED = 'POINTS_UPDATED',
  DUEL_INVITATION_RECEIVED = 'DUEL_INVITATION_RECEIVED',
  DUEL_INITIATED = 'DUEL_INITIATED',
  DUEL_ACCEPTED = 'DUEL_ACCEPTED',
  DUEL_REJECTED = 'DUEL_REJECTED',
  DUEL_COMPLETED = 'DUEL_COMPLETED',
}

registerEnumType(TriggerEventEnum, { name: 'TriggerEvent' });
