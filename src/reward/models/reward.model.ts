import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Challenge } from '../../challenge/models/challenge.model';
import { Game } from '../../game/models/game.model';
import { Player } from '../../player/models/player.model';
import { RewardType } from './reward-type.enum';

@Schema()
export class Reward extends Document {

  @Prop({ type: Types.ObjectId, ref: Game.name, required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: Game.name, nullable: true })
  parentChallenge?: any;

  @Prop({ type: String, enum: RewardType })
  kind: RewardType;

  @Prop()
  name: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop({ nullable: true })
  image?: string;

  @Prop({ default: () =>  false })
  recurrent: boolean;

  @Prop({ default: () => -1 })
  cost?: number;

  @Prop({ nullable: true })
  amount?: number;

  @Prop({ nullable: true })
  message?: string;

  @Prop({ type: [Types.ObjectId], ref: Challenge.name, nullable: true })
  challenges?: Challenge[];

  @Prop({ type: [Types.ObjectId], ref: Challenge.name })
  players?: Player[];
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
