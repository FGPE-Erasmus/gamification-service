import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Game } from '../../game/models/game.model';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

@Schema()
export class ScheduledHook extends Document {

  @Prop({ type: Types.ObjectId, ref: Game.name, required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: Game.name, nullable: true })
  parentChallenge?: any;

  @Prop({ nullable: true })
  criteria?: Criteria;

  @Prop({ default: () => [] })
  actions: Action[];

  @Prop()
  recurrent: boolean;

  @Prop({ nullable: true })
  cron?: string;

  @Prop({ nullable: true })
  interval?: number;

  @Prop({ default: () => true })
  active: boolean;

  @Prop({ nullable: true })
  lastRun?: Date;
}

export const ScheduledHookSchema = SchemaFactory.createForClass(ScheduledHook);
