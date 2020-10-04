import { LoggerService } from '@nestjs/common';
import { Document } from 'mongoose';

import { IService } from '../interfaces/service.interface';
import { IRepository } from '../interfaces/repository.interface';
import { toMongoId } from '../utils/mongo.utils';
import { IMapper } from '../interfaces/mapper.interface';

export abstract class BaseService<E extends Document, I, O> implements IService<E, I, O> {

  protected constructor(
    protected readonly logger: LoggerService,
    protected readonly repository: IRepository<E>,
    protected readonly toDtoMapper: IMapper<E, O>,
    protected readonly toPersistenceMapper: IMapper<I | Partial<I>, E | Partial<E>>,
  ) {
  }

  async create(input: I): Promise<O> {
    const doc: Partial<E> = await this.toPersistenceMapper.transform(input);
    const savedDoc: E = await this.repository.save(doc);
    return this.toDtoMapper.transform(savedDoc);
  }

  async update(id: string, input: I): Promise<O> {
    const doc: Partial<E> = await this.toPersistenceMapper.transform(input);
    doc._id = toMongoId(id);
    const savedDoc: E = await this.repository.save(doc);
    return this.toDtoMapper.transform(savedDoc);
  }

  async patch(id: string, input: Partial<I>): Promise<O> {
    const doc: Partial<E> = await this.toPersistenceMapper.transform(input);
    doc._id = toMongoId(id);
    const savedDoc: E = await this.repository.save(doc, false);
    return this.toDtoMapper.transform(savedDoc);
  }

  async findById(
    id: string,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O> {
    const savedDoc: E = await this.repository.getById(id, projection, options);
    return this.toDtoMapper.transform(savedDoc);
  }

  async findOne(
    conditions: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O> {
    const savedDoc: E = await this.repository.findOne(conditions, projection, options);
    return this.toDtoMapper.transform(savedDoc);
  }

  async findAll(
    conditions?: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O[]> {
    let docs: E[];
    if ( conditions ) {
      docs = await this.repository.findAll(conditions, projection, options);
    } else {
      docs = await this.repository.getAll(projection, options);
    }
    return Promise.all(docs.map<Promise<O>>(async doc => await this.toDtoMapper.transform(doc)));
  }

  async delete(id: string, soft = false): Promise<O> {
    if (soft) {
      return this.patch(id, { active: false } as any);
    }
    const savedDoc: E = await this.repository.deleteById(id);
    return this.toDtoMapper.transform(savedDoc);
  }

}
