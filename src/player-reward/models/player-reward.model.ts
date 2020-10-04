import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Player } from '../../player/models/player.model';
import { Reward } from '../../reward/models/reward.model';

@Schema()
export class PlayerReward extends Document {

  @Prop({ type: Types.ObjectId, ref: Player.name })
  player: Player;

  @Prop({ type: Types.ObjectId, ref: Reward.name })
  reward: Reward;

  @Prop({ default: 1 })
  count?: number;
}

export const PlayerRewardSchema = SchemaFactory.createForClass(PlayerReward);
