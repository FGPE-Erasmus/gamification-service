import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Player } from '../../player/models/player.model';
import { Leaderboard } from '../../leaderboard/models/leaderboard.model';

@Schema()
export class PlayerLeaderboard extends Document {

  @Prop({ type: Types.ObjectId, ref: Player.name })
  player: any;

  @Prop({ type: Types.ObjectId, ref: Leaderboard.name })
  leaderboard: any;

  @Prop({ type: Types.Map, of: String })
  score: Map<string, number>;
}

export const PlayerLeaderboardSchema = SchemaFactory.createForClass(PlayerLeaderboard);
