import { RewardType } from '../enum/reward-type.enum';

export interface IReward {
  id: any;
  name: string;
  type: RewardType;
  description: string;
  recurrenceLimit: number;
}

export class Reward {
  id: any;
  name: string;
  type: RewardType;
  description: string;
  recurrenceLimit: number;
}
