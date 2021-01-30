import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';
import { GameStateEnum } from '../enum/game-state.enum';

export interface Game extends IBaseEntity {
  name: string;
  description?: string;
  state: GameStateEnum;
  evaluationEngine?: string;
  gedilLayerId?: string;
  gedilLayerDescription?: string;
  startDate?: Date;
  endDate?: Date;
  instructors?: string[];
  players?: any[];
  submissions?: any[];
  validations?: any[];
}

@Schema({ collection: 'Game' })
export class GameDocument extends Document implements Game {
  @Prop()
  name: string;

  @Prop({ nullable: true })
  description?: string;

  @Prop()
  state: GameStateEnum;

  @Prop({ default: () => 'BASE' })
  evaluationEngine: string;

  @Prop({ nullable: true })
  gedilLayerId?: string;

  @Prop({ nullable: true })
  gedilLayerDescription?: string;

  @Prop({ nullable: true })
  startDate?: Date;

  @Prop({ nullable: true })
  endDate?: Date;

  @Prop({ type: () => [String], default: () => [] })
  instructors?: string[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  players?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Submission' }] })
  submissions?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Validation' }] })
  validations?: any[];
}

export const GameSchema = SchemaFactory.createForClass(GameDocument);
