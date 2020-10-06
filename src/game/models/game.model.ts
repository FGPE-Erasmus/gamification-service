import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Player } from '../../player/models/player.model';
import { Submission } from '../../submission/models/submission.model';

@Schema()
export class Game extends Document {
  @Prop()
  name: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop({ nullable: true })
  gedilLayerId?: string;

  @Prop({ nullable: true })
  gedilLayerDescription?: string;

  @Prop({ nullable: true })
  startDate?: Date;

  @Prop({ nullable: true })
  endDate?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Player' })
  players?: any[];

  @Prop({ type: [Types.ObjectId], ref: 'Submission' })
  submissions?: any[];
}

export const GameSchema = SchemaFactory.createForClass(Game);
