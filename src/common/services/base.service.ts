import { LoggerService } from '@nestjs/common';
import { Document, FilterQuery } from 'mongoose';

import { IService } from '../interfaces/service.interface';
import { IRepository } from '../interfaces/repository.interface';
import { toMongoId } from '../utils/mongo.utils';

export abstract class BaseService<E extends Document> implements IService<E> {
  protected constructor(protected readonly logger: LoggerService, protected readonly repository: IRepository<E>) {}

  async create(input: Omit<E, keyof Document>): Promise<E> {
    return await this.repository.save(input as E);
  }

  async update(id: string, input: Omit<E, keyof Document>): Promise<E> {
    return await this.repository.save({
      _id: toMongoId(id),
      ...input,
    });
  }

  async patch(id: string, input: Partial<Omit<E, keyof Document>>): Promise<E> {
    return await this.repository.save(
      {
        _id: toMongoId(id),
        ...input,
      },
      false,
    );
  }

  async findById(
    id: string,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<E> {
    return await this.repository.getById(id, projection, options);
  }

  async findOne(
    conditions: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<E> {
    return await this.repository.findOne(conditions, projection, options);
  }

  async findAll(
    conditions?: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<E[]> {
    let docs: E[];
    if (conditions) {
      docs = await this.repository.findAll(conditions, projection, options);
    } else {
      docs = await this.repository.getAll(projection, options);
    }
    return docs;
  }

  async delete(id: string, soft = false): Promise<E> {
    if (soft) {
      return this.patch(id, { active: false } as any);
    }
    return await this.repository.deleteById(id);
  }
}
