import { Document } from 'mongoose';

export interface IService<E extends Document> {
  create(input: Omit<E, keyof Document>): Promise<E>;

  update(id: string, input: Omit<E, keyof Document>): Promise<E>;

  patch(id: string, input: Partial<Omit<E, keyof Document>>): Promise<E>;

  findById(id: string, projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<E>;

  findOne(
    conditions: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<E>;

  findAll(
    conditions?: Partial<Record<keyof E, unknown>>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<E[]>;

  delete(id: string): Promise<E>;
}
