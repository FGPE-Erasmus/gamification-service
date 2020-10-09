import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PlayerReward extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player: any;

  @Prop({ type: Types.ObjectId, ref: 'Reward' })
  reward: any;

  @Prop({ default: 1 })
  count?: number;
}

export const PlayerRewardSchema = SchemaFactory.createForClass(PlayerReward);
