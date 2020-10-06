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

  @Prop({ type: () => [String] })
  metrics: string[];

  @Prop({ type: () => [String], enum: SortingOrder })
  sortingOrders: SortingOrder[];
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
