import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { EventService } from '../event/event.service';
import { ActionHookService } from '../hook/action-hook.service';
import { CategoryEnum } from '../hook/enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { Player } from '../player/models/player.model';
import { PlayerService } from '../player/player.service';
import { RewardType } from './models/reward-type.enum';
import { Reward } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';

@Injectable()
export class RewardService extends BaseService<Reward> {
  constructor(
    protected readonly repository: RewardRepository,
    protected readonly eventService: EventService,
    protected readonly playerService: PlayerService,
    protected readonly actionHookService: ActionHookService,
  ) {
    super(new Logger(RewardService.name), repository);
  }

  /**
   * Import GEdIL entries from a reward.
   *
   * @param {any} importTracker the objects already imported from the same archive.
   * @param {Game} game the game which is being imported.
   * @param {[path: string]: Buffer} entries the archive entries to import.
   * @param {Challenge} challenge the challenge to which this reward is
   *                              appended (if any).
   * @returns {Promise<Reward | undefined>} the imported reward.
   */
  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards' | 'rules']: { [k: string]: string } },
    game: Game,
    entries: { [path: string]: Buffer },
    challenge?: Challenge,
  ): Promise<Reward | undefined> {
    if (!('metadata.json' in entries)) {
      return;
    }

    const encodedContent = extractToJson(entries['metadata.json']);

    // create reward
    const reward: Reward = await this.create({
      ...encodedContent,
      challenges: encodedContent.challenges?.map(gedilId => importTracker.challenges[gedilId]),
      game: game.id,
      parentChallenge: challenge?.id,
    });

    // if reward is appended to a challenge, set up a hook to give it when
    // challenge is complete
    if (challenge) {
      await this.actionHookService.create({
        game: game.id.toString(),
        parentChallenge: challenge?.id?.toString(),
        trigger: TriggerEvent.CHALLENGE_COMPLETED,
        sourceId: challenge?.id?.toString(),
        actions: [
          {
            type: CategoryEnum.GIVE,
            parameters: [reward.id.toString()],
          },
        ],
        recurrent: false,
        active: true,
      });
    }

    return reward;
  }

  /**
   * Find all rewards of a kind.
   *
   * @returns {Promise<Reward[]>} the rewards.
   */
  async findByKind(kind?: RewardType): Promise<Reward[]> {
    return await this.findAll({ kind: { $eq: kind } });
  }
}
