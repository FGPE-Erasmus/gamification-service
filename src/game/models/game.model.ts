import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

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

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  players?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Submission' }] })
  submissions?: any[];

  /* Timestamps */

  createdAt?: Date;
  updatedAt?: Date;
}

export const GameSchema = SchemaFactory.createForClass(Game);
