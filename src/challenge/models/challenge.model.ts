import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Difficulty } from './difficulty.enum';
import { Mode } from './mode.enum';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Challenge extends IBaseEntity {
  game: any;
  parentChallenge?: any;
  name: string;
  description: string;
  difficulty: Difficulty;
  mode: Mode;
  modeParameters: string[];
  refs: string[];
  locked: boolean;
  hidden: boolean;
}

@Schema({ collection: 'Challenge' })
export class ChallengeDocument extends Document implements Challenge {
  @Prop({ type: Types.ObjectId, ref: 'Game', required: true })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: false })
  parentChallenge?: any;

  @Prop()
  name: string;

  @Prop({ nullable: true })
  description: string;

  @Prop({ type: () => String, enum: Difficulty, default: () => Difficulty.AVERAGE })
  difficulty: Difficulty;

  @Prop({ type: () => String, enum: Mode, default: () => Mode.NORMAL })
  mode: Mode;

  @Prop({ type: () => [String], default: () => [] })
  modeParameters: string[];

  @Prop({ type: () => [String], default: () => [] })
  refs: string[];

  @Prop({ default: false })
  locked: boolean;

  @Prop({ default: false })
  hidden: boolean;
}

export const ChallengeSchema = SchemaFactory.createForClass(ChallengeDocument);
