import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ActionHook, ActionHookDocument } from './models/action-hook.model';

@Injectable()
export class ActionHookService extends BaseService<ActionHook, ActionHookDocument> {
  constructor(protected readonly repository: ActionHookRepository) {
    super(new Logger(ActionHookService.name), repository);
  }

  /**
   * Find all hooks within a specific game.
   *
   * @param gameId the ID of the game
   * @returns {Promise<ActionHook[]>} the hooka.
   */
  async findByGameId(gameId: string): Promise<ActionHook[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }
}
