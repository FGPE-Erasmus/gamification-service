import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { SortingOrder } from './sorting.enum';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Leaderboard extends IBaseEntity {
  game: any;
  parentChallenge?: any;
  name: string;
  groups: boolean;
  metrics: string[];
  sortingOrders: SortingOrder[];
}

@Schema({ collection: 'Leaderboard' })
export class LeaderboardDocument extends Document implements Leaderboard {
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
}

export const LeaderboardSchema = SchemaFactory.createForClass(LeaderboardDocument);
