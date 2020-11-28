import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface PlayerReward extends IBaseEntity {
  player: any;
  reward: any;
  count?: number;
}

@Schema({ collection: 'PlayerReward' })
export class PlayerRewardDocument extends Document implements PlayerReward {
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player: any;

  @Prop({ type: Types.ObjectId, ref: 'Reward' })
  reward: any;

  @Prop({ default: 1 })
  count?: number;
}

export const PlayerRewardSchema = SchemaFactory.createForClass(PlayerRewardDocument);
