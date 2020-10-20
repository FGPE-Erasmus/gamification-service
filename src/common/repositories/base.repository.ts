import { LoggerService } from '@nestjs/common';
import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';

import { IRepository } from '../interfaces/repository.interface';
import { toMongoId } from '../utils/mongo.utils';

export class BaseRepository<E extends Document> implements IRepository<E> {
  protected constructor(protected readonly logger: LoggerService, protected readonly model: Model<E>) {}

  async exists(doc: Partial<E>): Promise<boolean> {
    if (!doc._id) {
      return false;
    }
    return this.model.exists({ _id: doc._id });
  }

  async existsById(id: string): Promise<boolean> {
    return this.model.exists({ _id: toMongoId(id) });
  }

  async getById(
    id: string,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<E> {
    return this.model.findById(id, projection, options).exec();
  }

  async getAll(projection: string | Record<string, unknown> = {}, options: Record<string, unknown> = {}): Promise<E[]> {
    return this.model.find({}, projection, options).exec();
  }

  async findOne(
    conditions: FilterQuery<E>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<E> {
    return this.model.findOne(conditions, projection, options).exec();
  }

  async findOneAndUpdate(
    conditions: FilterQuery<E>,
    updates?: UpdateQuery<E>,
    options?: Record<string, unknown>,
  ): Promise<E> {
    return this.model.findOneAndUpdate(conditions, updates, options).exec();
  }

  async findAll(
    conditions: FilterQuery<E>,
    projection: string | Record<string, unknown> = {},
    options: Record<string, unknown> = {},
  ): Promise<E[]> {
    return this.model.find(conditions, projection, options).exec();
  }

  async save(doc: Partial<E>, overwrite = true): Promise<any> {
    const exists: boolean = await this.exists(doc);
    if (!exists) {
      return new this.model(doc).save();
    } else {
      if (!overwrite) {
        return this.model
          .findByIdAndUpdate(
            doc._id,
            { ...doc },
            {
              new: true,
              omitUndefined: true,
              useFindAndModify: false,
            },
          )
          .exec();
      } else {
        return this.model
          .replaceOne({ _id: doc._id }, new this.model(doc))
          .setOptions({ upsert: true })
          .exec();
      }
    }
  }

  async delete(doc: Partial<E>): Promise<E> {
    return this.model.findByIdAndRemove(doc._id).exec();
  }

  async deleteOne(conditions: FilterQuery<E>, options: Record<string, unknown> = {}): Promise<E> {
    return this.model.findOneAndRemove(conditions, options).exec();
  }

  async deleteById(id: string): Promise<E> {
    return this.model.findByIdAndRemove(id).exec();
  }
}
