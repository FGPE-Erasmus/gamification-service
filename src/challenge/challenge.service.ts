import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';

import { ServiceHelper } from '../common/helpers/service.helper';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameEntity as Game } from '../game/entities/game.entity';
import { HookService } from '../hook/hook.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';
import { UpsertChallengeDto } from './dto/upsert-challenge.dto';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';

@Injectable()
export class ChallengeService {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly challengeRepository: ChallengeRepository,
    private readonly leaderboardService: LeaderboardService,
    private readonly rewardService: RewardService,
    private readonly hookService: HookService,
  ) {}

  async importGEdIL(
    game: Game,
    gedilId: string,
    entries: { [path: string]: Buffer },
    parentChallenge?: Challenge,
  ): Promise<Challenge | undefined> {
    let challenge: Challenge;

    const subEntries = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };
    for (const path of Object.keys(entries)) {
      if (path === 'metadata.json') {
        const encodedContent = extractToJson(entries[path]);
        challenge = await this.create({
          ...encodedContent,
          game: game.id,
          parentChallenge: parentChallenge?.id,
        });
      } else {
        const result = /^(challenges|leaderboards|rewards|rules)\/([^/]+)\//.exec(path);
        if (result) {
          const subpath = path.substring(result[0].length);
          if (!subEntries[result[1]][result[2]]) {
            subEntries[result[1]][result[2]] = {};
          }
          subEntries[result[1]][result[2]][subpath] = entries[path];
        } else {
          console.error('Unrecognized entry "challenges/%s/%s".', gedilId, path);
        }
      }
    }

    const subObjects = { challenges: {}, leaderboards: {}, rewards: {}, rules: {} };

    // inner challenges
    for (const gedilId of Object.keys(subEntries.challenges)) {
      subObjects.challenges[gedilId] = await this.importGEdIL(game, gedilId, subEntries.challenges[gedilId], challenge);
    }

    // inner leaderboards
    for (const gedilId of Object.keys(subEntries.leaderboards)) {
      subObjects.leaderboards[gedilId] = await this.leaderboardService.importGEdIL(
        game,
        subEntries.leaderboards[gedilId],
        challenge,
      );
    }

    // inner rewards
    for (const gedilId of Object.keys(subEntries.rewards)) {
      subObjects.rewards[gedilId] = await this.rewardService.importGEdIL(game, subEntries.rewards[gedilId], challenge);
    }

    // inner rules
    for (const gedilId of Object.keys(subEntries.rules)) {
      subObjects.rules[gedilId] = await this.hookService.importGEdIL(game, subEntries.rules[gedilId], challenge);
    }

    return challenge;
  }

  /**
   * Create a challenge with a set of provides fields.
   *
   * @param id of the challenge to create
   * @param data for creation
   */
  async create(data: UpsertChallengeDto): Promise<Challenge> {
    const newChallenge: Challenge = await this.serviceHelper.getUpsertData(null, { ...data }, this.challengeRepository);
    return this.challengeRepository.save(newChallenge);
  }

  /**
   * Find all challenges.
   *
   * @param {any} query the query to filter items
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findAll(query?: any): Promise<Challenge[]> {
    return await this.challengeRepository.find(query);
  }

  /**
   * Finds a challenge by its ID.
   *
   * @param {string} id of challenge
   * @returns {(Promise<Challenge | undefined>)}
   * @memberof ChallengeService
   */
  async findOne(id: string): Promise<Challenge> {
    return await this.challengeRepository.findOne({
      where: {
        _id: ObjectId(id),
      },
    });
  }
}
