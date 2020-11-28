import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { Challenge } from '../challenge/models/challenge.model';
import { Game } from '../game/models/game.model';
import { EventService } from '../event/event.service';
import { ActionHookService } from '../hook/action-hook.service';
import { PlayerService } from '../player/player.service';
import { RewardType } from './models/reward-type.enum';
import { Reward, RewardDocument } from './models/reward.model';
import { RewardRepository } from './repositories/reward.repository';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { CategoryEnum } from '../hook/enums/category.enum';

@Injectable()
export class RewardService extends BaseService<Reward, RewardDocument> {
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
    delete encodedContent.id;

    // create reward
    const reward = await this.create({
      ...encodedContent,
      game: game.id,
      parentChallenge: challenge?.id,
      challenges: encodedContent.challenges?.map(gedilId => importTracker.challenges[gedilId]),
    });

    // when appended to a challenge, assign on complete it
    if (challenge) {
      await this.actionHookService.create({
        game: game.id,
        parentChallenge: challenge.id,
        sourceId: challenge.id,
        trigger: TriggerEvent.CHALLENGE_COMPLETED,
        criteria: {
          conditions: [],
          junctors: [],
        },
        actions: [
          {
            type: CategoryEnum.GIVE,
            parameters: [reward.id as string],
          },
        ],
        recurrent: false,
        active: true,
      });
    }

    return reward;
  }

  /**
   * Find all rewards within a specific game (optionally of a specific kind).
   *
   * @param gameId the ID of the game
   * @param kind the type of rewards
   * @returns {Promise<Reward[]>} the rewards.
   */
  async findByGameId(gameId: string, kind?: RewardType): Promise<Reward[]> {
    const query: { game: any; kind?: any } = { game: { $eq: gameId } };
    if (kind) {
      query.kind = { $eq: kind };
    }
    return await this.findAll(query);
  }
}
