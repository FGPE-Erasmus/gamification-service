import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { StateEnum as State } from './state.enum';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface ChallengeStatus extends IBaseEntity {
  player: any;
  challenge: any;
  startedAt?: Date;
  openedAt?: Date;
  endedAt?: Date;
  state: State;
}

@Schema({ collection: 'ChallengeStatus' })
export class ChallengeStatusDocument extends Document implements ChallengeStatus {
  @Prop({ type: Types.ObjectId, ref: 'Player', required: true })
  player: any;

  @Prop({ type: Types.ObjectId, ref: 'Challenge', required: true })
  challenge: any;

  @Prop({ nullable: true })
  startedAt?: Date;

  @Prop()
  openedAt?: Date;

  @Prop({ nullable: true })
  endedAt?: Date;

  @Prop({ type: () => String, enum: State, default: () => State.AVAILABLE })
  state: State;
}

export const ChallengeStatusSchema = SchemaFactory.createForClass(ChallengeStatusDocument);
