import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { PlayerReward } from '../../player-reward/models/player-reward.model';
import { User } from '../../users/models/user.model';
import { Game } from '../../game/models/game.model';
import { Submission } from '../../submission/models/submission.model';
import { ChallengeStatus } from '../../challenge-status/models/challenge-status.model';

@Schema()
export class Player extends Document {

  @Prop({ type: Types.ObjectId, ref: User.name })
  user: any;

  @Prop({ type: Types.ObjectId, ref: Game.name })
  game: any;

  @Prop({ default: () => 0 })
  points: number;

  @Prop({ type: [ Types.ObjectId ], ref: Submission.name })
  submissions: any[];

  @Prop({ type: [ Types.ObjectId ], ref: ChallengeStatus.name })
  learningPath: any[];

  @Prop({ type: [ Types.ObjectId ], ref: PlayerReward.name })
  rewards: any[];
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
