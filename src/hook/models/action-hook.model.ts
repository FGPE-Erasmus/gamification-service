import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Game } from '../../game/models/game.model';
import { TriggerEventEnum as TriggerEvent } from '../enums/trigger-event.enum';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

@Schema()
export class ActionHook extends Document {

  @Prop({ type: Types.ObjectId, ref: Game.name, required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: Game.name, nullable: true })
  parentChallenge?: any;

  @Prop({ type: String, enum: TriggerEvent })
  trigger: TriggerEvent;

  @Prop({ nullable: true })
  sourceId?: string;

  @Prop({ nullable: true })
  criteria?: Criteria;

  @Prop({ default: () => [] })
  actions: Action[];

  @Prop({ default: () => true })
  recurrent: boolean;

  @Prop({ default: () => true })
  active: boolean;

  @Prop({ nullable: true })
  lastRun?: Date;
}

export const ActionHookSchema = SchemaFactory.createForClass(ActionHook);
