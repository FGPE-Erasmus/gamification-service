import { Types } from 'mongoose';

export function toMongoId(id: string): any {
  return new Types.ObjectId(id);
}

export function toString(id: Types.ObjectId): string {
  return id?.toHexString();
}
