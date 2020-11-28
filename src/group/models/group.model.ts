import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Group extends IBaseEntity {
  game: any;
  name: string;
  displayName?: string;
  imageUrl?: string;
  players?: any[];
}

@Schema({ collection: 'Group' })
export class GroupDocument extends Document {
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
}

export const GroupSchema = SchemaFactory.createForClass(GroupDocument);
