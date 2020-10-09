import { Document, FilterQuery } from 'mongoose';

export interface IRepository<E extends Document> {
  /**
   * Check if the document is already saved in the database.
   *
   * @param {E} doc the document to check for existence.
   */
  exists(doc: Partial<E>): Promise<boolean>;

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
  getById(id: string, projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<E>;

  /**
   * Get all documents in collection.
   *
   * @param projection the projections to apply in the query.
   * @param options the query options.
   */
  getAll(projection?: string | Record<string, unknown>, options?: Record<string, unknown>): Promise<E[]>;

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
  ): Promise<E>;

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
  ): Promise<E[]>;

  /**
   * Save a document into the database.
   *
   * @param {Partial<E>} doc the document to save.
   * @param {boolean} overwrite replace the current?
   */
  save(doc: Partial<E>, overwrite?: boolean): Promise<E>;

  /**
   * Delete a document from the database.
   *
   * @param {Partial<E>} doc the document to delete.
   */
  delete(doc: Partial<E>): Promise<E>;

  /**
   * Delete a document by ID from the database.
   *
   * @param {string} id ID of the document to delete.
   */
  deleteById(id: string): Promise<E>;
}
