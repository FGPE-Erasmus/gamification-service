import { Injectable } from '@nestjs/common';

import { ScheduledHookDto } from './dto/scheduled-hook.dto';
import { ScheduledHookInput } from './input/scheduled-hook.input';
import { ScheduledHookRepository } from './repository/scheduled-hook.repository';

@Injectable()
export class ScheduledHookService {
  constructor(private readonly scheduledHookRepository: ScheduledHookRepository) {}

  /**
   * Create one scheduled hook.
   *
   * @param {ScheduledHookInput} input the scheduled hook data to create.
   * @returns {(Promise<ScheduledHookDto>)}
   */
  async create(input: ScheduledHookInput): Promise<ScheduledHookDto> {
    return await this.scheduledHookRepository.save(input);
  }

  /**
   * Find all scheduled hooks.
   *
   * @returns {Promise<ScheduledHookDto[]>} the scheduled hooks.
   */
  async findAll(): Promise<ScheduledHookDto[]> {
    return await this.scheduledHookRepository.find();
  }

  /**
   * Finds a scheduled hook by its ID.
   *
   * @param {string} id of the scheduled hook
   * @returns {(Promise<ScheduledHookDto | undefined>)}
   * @memberof ScheduledHookService
   */
  async findOne(id: string): Promise<ScheduledHookDto | undefined> {
    return await this.scheduledHookRepository.findOne(id);
  }
}
