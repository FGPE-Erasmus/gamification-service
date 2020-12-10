import { LoggerService } from '@nestjs/common';
import { Document, FilterQuery, Model, MongooseFilterQuery, UpdateQuery } from 'mongoose';

import { IBaseEntity } from '../interfaces/base-entity.interface';
import { IRepository } from '../interfaces/repository.interface';
import { toMongoId } from '../utils/mongo.utils';
import { omit } from '../utils/object.utils';

export class BaseRepository<I extends IBaseEntity, E extends I & Document> implements IRepository<I, E> {
  protected constructor(protected readonly logger: LoggerService, protected readonly model: Model<E>) {}

  async exists(doc: Partial<I>): Promise<boolean> {
    if (!doc.id) {
      return false;
    }
    return this.existsById(doc.id);
  }

  async existsById(id: string): Promise<boolean> {
    return this.model.exists({ _id: toMongoId(id) });
  }

  async getById(
    id: string,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<I> {
    return this.model
      .findById(id, projection, options)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async getAll(projection: string | Record<string, unknown> = {}, options: Record<string, unknown> = {}): Promise<I[]> {
    return this.model
      .find({}, projection, options)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async findOne(
    conditions: FilterQuery<E>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<I> {
    return this.model
      .findOne(conditions, projection, options)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async findOneAndUpdate(
    conditions: FilterQuery<E>,
    updates?: UpdateQuery<E>,
    options?: Record<string, unknown>,
  ): Promise<I> {
    return this.model
      .findOneAndUpdate(conditions, updates, { ...options, new: true })
      .lean<E>({ virtuals: true })
      .exec();
  }

  async findAll(
    conditions: FilterQuery<E>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<I[]> {
    return this.model
      .find(conditions, projection, options)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async save(doc: Partial<I>, overwrite = true): Promise<I> {
    const exists: boolean = await this.exists(doc);
    if (!exists) {
      const model = new this.model(doc);
      const saved = await model.save();
      return (saved.toObject({ virtuals: true }) as unknown) as I;
    } else {
      if (!overwrite) {
        return this.model
          .findByIdAndUpdate(doc.id, omit(['id', 'createdAt', 'updatedAt'], doc) as Partial<E>, {
            new: true,
            omitUndefined: true,
          })
          .lean<E>({ virtuals: true })
          .exec();
      } else {
        await this.model
          .update({ _id: toMongoId(doc.id) }, omit(['id', 'createdAt', 'updatedAt'], doc) as Partial<E>, {
            upsert: true,
            overwrite: true,
          })
          .exec();
        return this.getById(doc.id);
      }
    }
  }

  async delete(doc: Partial<I>): Promise<I> {
    return this.model
      .findByIdAndRemove(doc.id)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async deleteOne(conditions: FilterQuery<E>, options: Record<string, unknown> = {}): Promise<I> {
    return this.model
      .findOneAndRemove(conditions, options)
      .lean<E>({ virtuals: true })
      .exec();
  }

  async deleteIf(conditions: FilterQuery<E>, options: Record<string, unknown> = {}): Promise<I[]> {
    const toDelete = await this.findAll(conditions, null, options);
    await this.model.deleteMany({ _id: { $in: toDelete.map(item => item.id) } } as MongooseFilterQuery<E>, options);
    return toDelete;
  }

  async deleteById(id: string): Promise<I> {
    return this.model
      .findByIdAndRemove(id)
      .lean<E>({ virtuals: true })
      .exec();
  }
}
