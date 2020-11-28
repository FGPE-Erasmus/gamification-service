import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';
import { TriggerEventEnum as TriggerEvent } from '../enums/trigger-event.enum';
import { ActionEmbed as Action } from './embedded/action.embed';
import { CriteriaEmbed as Criteria } from './embedded/criteria.embed';

export interface ActionHook extends IBaseEntity {
  game: any;
  parentChallenge?: any;
  trigger: TriggerEvent;
  sourceId?: string;
  criteria?: Criteria;
  actions: Action[];
  recurrent: boolean;
  active: boolean;
  lastRun?: Date;
}

@Schema({ collection: 'ActionHook' })
export class ActionHookDocument extends Document implements ActionHook {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', nullable: true })
  parentChallenge?: any;

  @Prop({ type: () => String, enum: TriggerEvent })
  trigger: TriggerEvent;

  @Prop({ nullable: true })
  sourceId?: string;

  @Prop({ type: () => Criteria, nullable: true })
  criteria?: Criteria;

  @Prop({ type: () => [Action], default: () => [] })
  actions: Action[];

  @Prop({ default: true })
  recurrent: boolean;

  @Prop({ default: true })
  active: boolean;

  @Prop({ nullable: true })
  lastRun?: Date;
}

export const ActionHookSchema = SchemaFactory.createForClass(ActionHookDocument);
