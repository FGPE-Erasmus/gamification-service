import { Document } from 'mongoose';

export interface IService<E extends Document, I, O> {

  create(input: I): Promise<O>;

  update(id: string, input: I): Promise<O>;

  patch(id: string, input: Partial<I>): Promise<O>;

  findById(
    id: string,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O>;

  findOne(
    conditions: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O>;

  findAll(
    conditions?: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<O[]>;

  delete(id: string): Promise<O>;

}
