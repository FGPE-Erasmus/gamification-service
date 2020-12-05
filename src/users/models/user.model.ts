import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { IBaseEntity } from '../../common/interfaces/base-entity.interface';
import { Role } from '../../common/enums/role.enum';

export interface User extends IBaseEntity {
  name: string;
  username: string;
  email: string;
  password?: string;
  roles?: Role[];
  photo?: string;
  telephone?: string;
  birthDate?: Date;
  active?: boolean;
  lastActivityAt?: Date;
  registrations?: any[];
}

@Schema({ collection: 'User' })
export class UserDocument extends Document implements User {
  @Prop()
  name: string;

  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password?: string;

  @Prop({ type: () => [String], enum: Role, default: () => [Role.STUDENT] })
  roles?: Role[];

  @Prop()
  photo?: string;

  @Prop()
  telephone?: string;

  @Prop()
  birthDate?: Date;

  @Prop({ default: true })
  active?: boolean;

  @Prop()
  lastActivityAt?: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Player' }] })
  registrations?: any[];
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);
