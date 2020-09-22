import { Injectable } from '@nestjs/common';

import { ActionHookDto } from './dto/action-hook.dto';
import { ActionHookInput } from './input/action-hook.input';
import { ActionHookRepository } from './repository/action-hook.repository';

@Injectable()
export class ActionHookService {
  constructor(private readonly actionHookRepository: ActionHookRepository) {}

  /**
   * Create one action hook.
   *
   * @param {ActionHookInput} input the action hook data to create.
   * @returns {(Promise<ActionHookDto>)}
   */
  async create(input: ActionHookInput): Promise<ActionHookDto> {
    return await this.actionHookRepository.save(input);
  }

  /**
   * Find all action hooks.
   *
   * @returns {Promise<ActionHookDto[]>} the action hooks.
   */
  async findAll(): Promise<ActionHookDto[]> {
    return await this.actionHookRepository.find();
  }

  /**
   * Finds an action hook by its ID.
   *
   * @param {string} id of the action hook
   * @returns {(Promise<ActionHookDto | undefined>)}
   * @memberof ActionHookService
   */
  async findOne(id: string): Promise<ActionHookDto | undefined> {
    return await this.actionHookRepository.findOne(id);
  }
}
