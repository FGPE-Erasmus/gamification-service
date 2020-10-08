import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { Role } from './role.enum';

@Schema()
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ type: () => [String], enum: Role, default: () => [Role.USER] })
  roles?: Role[];

  @Prop()
  photo?: string;

  @Prop()
  telephone?: string;

  @Prop()
  birthDate?: Date;

  @Prop()
  active: boolean;

  @Prop()
  lastActivityAt?: Date;

  @Prop({
    type: [Types.ObjectId],
    ref: 'Player',
  })
  registrations?: any[];

  /* Timestamps */

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
