import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Result } from './result.enum';
import { EvaluationEngine } from './evaluation-engine.enum';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Submission extends IBaseEntity {
  game: any;
  player: any;
  exerciseId: string;
  evaluationEngine?: EvaluationEngine;
  evaluationEngineId?: string;
  language?: string;
  metrics?: Map<string, number>;
  result?: Result;
  grade?: number;
  feedback?: string;
  submittedAt?: Date;
  evaluatedAt?: Date;
}

@Schema({ collection: 'Submission' })
export class SubmissionDocument extends Document implements Submission {
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

  @Prop({ type: () => String, enum: Result })
  result?: Result;

  @Prop({ nullable: true })
  grade?: number;

  @Prop({ nullable: true })
  feedback?: string;

  @Prop({ type: Date, default: () => Date.now() })
  submittedAt?: Date;

  @Prop({ type: Date, nullable: true })
  evaluatedAt?: Date;
}

export const SubmissionSchema = SchemaFactory.createForClass(SubmissionDocument);
