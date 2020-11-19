import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { SortingOrder } from './sorting.enum';

@Schema()
export class Leaderboard extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: false })
  parentChallenge?: any;

  @Prop()
  name: string;

  @Prop()
  groups: boolean;

  @Prop({ type: () => [String], default: () => [] })
  metrics: string[];

  @Prop({ type: () => [String], enum: SortingOrder, default: () => [] })
  sortingOrders: SortingOrder[];

  /* Timestamps */

  createdAt?: Date;
  updatedAt?: Date;
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
