import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';
import { EvaluationEngine } from './evaluation-engine.enum';
import { Result } from './result.enum';

export interface Validation extends IBaseEntity {
  game: any;
  player: any;
  exerciseId: string;
  evaluationEngine?: EvaluationEngine;
  evaluationEngineId?: string;
  language?: string;
  metrics?: Map<string, number>;
  outputs?: { [k: string]: string };
  userExecutionTimes?: { [k: string]: string };
  result?: Result;
  feedback?: string;
  submittedAt?: Date;
  evaluatedAt?: Date;
}

@Schema({ collection: 'Validation' })
export class ValidationDocument extends Document implements Validation {
  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Player' })
  player: any;

  @Prop()
  exerciseId: string;

  @Prop({ type: () => String, enum: EvaluationEngine })
  evaluationEngine?: EvaluationEngine;

  @Prop()
  evaluationEngineId?: string;

  @Prop()
  language?: string;

  @Prop(raw({ type: Types.Map, of: String, default: () => ({}) }))
  metrics?: Map<string, number>;

  @Prop(raw({ type: Types.Map, of: String, default: () => ({}) }))
  outputs?: { [k: string]: string };

  @Prop(raw({ type: Types.Map, of: String, default: () => ({}) }))
  userExecutionTimes?: { [k: string]: string };

  @Prop({ type: () => String, enum: Result })
  result?: Result;

  @Prop({ nullable: true })
  feedback?: string;

  @Prop({ type: Date, default: () => Date.now() })
  submittedAt?: Date;

  @Prop({ type: Date, nullable: true })
  evaluatedAt?: Date;
}

export const ValidationSchema = SchemaFactory.createForClass(ValidationDocument);
