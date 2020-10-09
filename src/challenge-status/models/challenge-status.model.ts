import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Challenge } from '../../challenge/models/challenge.model';
import { Player } from '../../player/models/player.model';
import { State } from './state.enum';

@Schema()
export class ChallengeStatus extends Document {
  @Prop({ type: Types.ObjectId, ref: Player.name, required: true })
  player: any;

  @Prop({ type: Types.ObjectId, ref: Challenge.name, required: true })
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

export const ChallengeStatusSchema = SchemaFactory.createForClass(ChallengeStatus);
