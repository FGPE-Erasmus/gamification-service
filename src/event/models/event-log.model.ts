import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface EventLog extends IBaseEntity {
  game: any;
  actionHook?: any;
  scheduledHook?: any;
  player?: any;
  challenge?: any;
  reward?: any;
  activityId?: string;
  timestamp: Date;
}

@Schema({ collection: 'EventLog' })
export class EventLogDocument extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'ActionHook' })
  actionHook?: any;

  @Prop({ type: Types.ObjectId, ref: 'ScheduledHook' })
  scheduledHook?: any;

  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player?: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge' })
  challenge?: any;

  @Prop({ type: Types.ObjectId, ref: 'Reward' })
  reward?: any;

  @Prop()
  activityId?: string;

  @Prop()
  timestamp: Date;
}

export const EventLogSchema = SchemaFactory.createForClass(EventLogDocument);
