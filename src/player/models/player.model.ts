import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IBaseEntity } from '../../common/interfaces/base-entity.interface';

export interface Player extends IBaseEntity {
  user: any;
  game: any;
  group?: any;
  points?: number;
  submissions?: any[];
  learningPath?: any[];
  rewards?: any[];
}

@Schema({ collection: 'Player' })
export class PlayerDocument extends Document implements Player {
  @Prop()
  user: string;

  @Prop({ type: Types.ObjectId, ref: 'Game' })
  game: any;

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  group?: any;

  @Prop({ default: () => 0 })
  points?: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Submission' }] })
  submissions?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'ChallengeStatus' }] })
  learningPath?: any[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'PlayerReward' }] })
  rewards?: any[];
}

export const PlayerSchema = SchemaFactory.createForClass(PlayerDocument);
