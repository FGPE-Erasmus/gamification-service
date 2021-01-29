import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

export interface ScheduledHook extends IBaseEntity {
  game: any;
  parentChallenge?: any;
  criteria?: Criteria;
  actions: Action[];
  recurrent: boolean;
  cron?: string | Date;
  interval?: number;
  active: boolean;
  lastRun?: Date;
}

@Schema({ collection: 'ScheduledHook' })
export class ScheduledHookDocument extends Document implements ScheduledHook {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', nullable: true })
  parentChallenge?: any;

  @Prop({ type: () => Criteria, nullable: true })
  criteria?: Criteria;

  @Prop({ type: () => [Action], default: () => [] })
  actions: Action[];

  @Prop()
  recurrent: boolean;

  @Prop({ type: String || Date, nullable: true })
  cron?: string | Date;

  @Prop({ nullable: true })
  interval?: number;

  @Prop({ default: () => true })
  active: boolean;

  @Prop({ nullable: true })
  lastRun?: Date;
}

export const ScheduledHookSchema = SchemaFactory.createForClass(ScheduledHookDocument);
