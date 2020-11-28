import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { RewardType } from './reward-type.enum';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Reward extends IBaseEntity {
  game: any;
  parentChallenge?: any;
  kind: RewardType;
  name: string;
  description?: string;
  image?: string;
  recurrent: boolean;
  cost?: number;
  amount?: number;
  message?: string;
  challenges?: any[];
  players?: any[];
}

@Schema({ collection: 'Reward' })
export class RewardDocument extends Document implements Reward {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', nullable: true })
  parentChallenge?: any;

  @Prop({ type: () => String, enum: RewardType })
  kind: RewardType;

  @Prop()
  name: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop({ nullable: true })
  image?: string;

  @Prop({ default: () => false })
  recurrent: boolean;

  @Prop({ default: () => -1 })
  cost?: number;

  @Prop({ nullable: true })
  amount?: number;

  @Prop({ nullable: true })
  message?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Challenge' }], nullable: true })
  challenges?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PlayerReward' }] })
  players?: any[];
}

export const RewardSchema = SchemaFactory.createForClass(RewardDocument);
