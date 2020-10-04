import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Challenge } from '../../challenge/models/challenge.model';
import { Game } from '../../game/models/game.model';
import { SortingOrder } from './sorting.enum';

@Schema()
export class Leaderboard extends Document {

  @Prop({ type: Types.ObjectId, ref: Game.name, required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: Challenge.name, required: false })
  parentChallenge?: any;

  @Prop()
  name: string;

  @Prop()
  metrics: string[];

  @Prop({ type: [String], enum: SortingOrder })
  sortingOrders: SortingOrder[];
}

export const LeaderboardSchema = SchemaFactory.createForClass(Leaderboard);
