import { LoggerService } from '@nestjs/common';
import { Document, FilterQuery, UpdateQuery } from 'mongoose';

import { IService } from '../interfaces/service.interface';
import { IRepository } from '../interfaces/repository.interface';
import { toMongoId } from '../utils/mongo.utils';
import { IBaseEntity } from '../interfaces/base-entity.interface';

export abstract class BaseService<I extends IBaseEntity, E extends I & Document> implements IService<I, E> {
  protected constructor(protected readonly logger: LoggerService, protected readonly repository: IRepository<I, E>) {}

  async create(input: I): Promise<I> {
    return await this.repository.save(input);
  }

  async update(id: string, input: I): Promise<I> {
    return await this.repository.save({
      id: toMongoId(id),
      ...input,
    });
  }

  async patch(id: string, input: Partial<I>): Promise<I> {
    return await this.repository.save(
      {
        id: toMongoId(id),
        ...input,
      },
      false,
    );
  }

  async findOneAndUpdate(
    conditions: FilterQuery<E>,
    updates: UpdateQuery<E>,
    options?: Record<string, unknown>,
  ): Promise<I> {
    return await this.repository.findOneAndUpdate(conditions, updates, options);
  }

  async findById(
    id: string,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I> {
    return await this.repository.getById(id, projection, options);
  }

  async findOne(
    conditions: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I> {
    return await this.repository.findOne(conditions, projection, options);
  }

  async findAll(
    conditions?: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I[]> {
    let docs: I[];
    if (conditions) {
      docs = await this.repository.findAll(conditions, projection, options);
    } else {
      docs = await this.repository.getAll(projection, options);
    }
    return docs;
  }

  async delete(id: string, soft = false): Promise<I> {
    if (soft) {
      return this.patch(id, { active: false } as any);
    }
    return await this.repository.deleteById(id);
  }

  async deleteOne(conditions: FilterQuery<E>, options?: Record<string, unknown>): Promise<I> {
    return await this.repository.deleteOne(conditions, options);
  }
}
