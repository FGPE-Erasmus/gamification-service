import { Document, FilterQuery, UpdateQuery } from 'mongoose';
import { IBaseEntity } from './base-entity.interface';
import { Submission } from '../../submission/models/submission.model';

export interface IRepository<I extends IBaseEntity, E extends I & Document> {
  /**
   * Check if the document is already saved in the database.
   *
   * @param {E} doc the document to check for existence.
   */
  exists(doc: Partial<I>): Promise<boolean>;

  /**
   * Check if the document with given ID is already saved in the database.
   *
   * @param {string} id ID of the document to check for existence.
   */
  existsById(id: string): Promise<boolean>;

  /**
   * Get a document by ID.
   *
   * @param {string} id ID of the document to obtain.
   * @param projection the projections to apply in the query.
   * @param options the query options.
   */
  getById(id: string, projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<I>;

  /**
   * Get all documents in collection.
   *
   * @param projection the projections to apply in the query.
   * @param options the query options.
   */
  getAll(projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<I[]>;

  /**
   * Find a document matching the given criteria.
   *
   * @param conditions the conditions to test.
   * @param projection the projections to apply in the query.
   * @param options the query options.
   */
  findOne(
    conditions: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I>;

  /**
   * Find a document in the database and update.
   *
   * @param conditions the conditions to test.
   * @param updates the updates to apply in the results.
   * @param options the query options.
   */
  findOneAndUpdate(
    conditions: FilterQuery<E>,
    updates?: UpdateQuery<any>,
    options?: Record<string, unknown>,
  ): Promise<I>;

  /**
   * Find all documents matching the given criteria.
   *
   * @param conditions the conditions to test.
   * @param projection the projections to apply in the query.
   * @param options the query options.
   */
  findAll(
    conditions?: FilterQuery<E>,
    projection?: string | Record<string, unknown>,
    options?: Record<string, unknown>,
  ): Promise<I[]>;

  /**
   * Save a document into the database.
   *
   * @param {Partial<E>} doc the document to save.
   * @param {boolean} overwrite replace the current?
   */
  save(doc: Partial<I>, overwrite?: boolean): Promise<I>;

  /**
   * Delete a document from the database.
   *
   * @param {Partial<E>} doc the document to delete.
   */
  delete(doc: Partial<I>): Promise<I>;

  /**
   * Delete a document with particular field's values from the database.
   *
   * @param conditions the conditions to test.
   * @param options the query options.
   */
  deleteOne(conditions: FilterQuery<E>, options?: Record<string, unknown>): Promise<I>;

  /**
   * Delete a document by ID from the database.
   *
   * @param {string} id ID of the document to delete.
   */
  deleteById(id: string): Promise<I>;

  /**
   * Delete all documents from the database matching criteria.
   *
   * @param conditions the conditions to test.
   * @param options the query options.
   */
  deleteIf(conditions: FilterQuery<E>, options: Record<string, unknown>): Promise<I[]>;
}
