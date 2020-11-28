import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHook, ScheduledHookDocument } from './models/scheduled-hook.model';

@Injectable()
export class ScheduledHookService extends BaseService<ScheduledHook, ScheduledHookDocument> {
  constructor(protected readonly repository: ScheduledHookRepository) {
    super(new Logger(ScheduledHookService.name), repository);
  }

  /**
   * Find all hooks within a specific game.
   *
   * @param gameId the ID of the game
   * @returns {Promise<ScheduledHook[]>} the hooks.
   */
  async findByGameId(gameId: string): Promise<ScheduledHook[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }
}
