import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Group extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: any;

  @Prop()
  name: string;

  @Prop()
  displayName?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  players?: any[];

  /* Timestamps */

  createdAt?: Date;
  updatedAt?: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
