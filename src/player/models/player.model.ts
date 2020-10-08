import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Player extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: any;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: any;

  @Prop({ default: () => 0 })
  points: number;

  @Prop({ type: [Types.ObjectId], ref: 'Submission' })
  submissions: any[];

  @Prop({ type: [Types.ObjectId], ref: 'ChallengeStatus' })
  learningPath: any[];

  @Prop({ type: [Types.ObjectId], ref: 'PlayerReward' })
  rewards: any[];

  /* Timestamps */

  createdAt?: Date;
  updatedAt?: Date;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
