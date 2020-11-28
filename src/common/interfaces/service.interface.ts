import { Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseEntity } from './base-entity.interface';

export interface IService<I extends IBaseEntity, E extends I & Document> {
  create(input: I): Promise<I>;

  update(id: string, input: I): Promise<I>;

  patch(id: string, input: Partial<I>): Promise<I>;

  findById(id: string, projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<I>;

  findOne(
    conditions: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I>;

  findOneAndUpdate(
    conditions: FilterQuery<E>,
    updates?: UpdateQuery<any>,
    options?: Record<string, unknown>,
  ): Promise<I>;

  findAll(
    conditions?: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I[]>;

  delete(id: string): Promise<I>;

  deleteOne(conditions: FilterQuery<E>, options?: Record<string, unknown>): Promise<I>;
}
