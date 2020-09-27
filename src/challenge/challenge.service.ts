import { ServiceHelper } from '../common/helpers/service.helper';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameEntity as Game } from '../game/entities/game.entity';
import { HookService } from '../hook/hook.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';
import { UpsertChallengeDto } from './dto/upsert-challenge.dto';
import { ChallengeRepository } from './repositories/challenge.repository';
import { ChallengeEntity as Challenge } from './entities/challenge.entity';
import { QueryService } from '@nestjs-query/core';
import { TypeOrmQueryService } from '@nestjs-query/query-typeorm';
import { Mode } from './entities/mode.enum';

@QueryService(Challenge)
export class ChallengeService extends TypeOrmQueryService<Challenge> {
  constructor(
    private readonly serviceHelper: ServiceHelper,
    private readonly challengeRepository: ChallengeRepository,
    private readonly leaderboardService: LeaderboardService,
    private readonly rewardService: RewardService,
    private readonly hookService: HookService,
  ) {
    super(challengeRepository);
  }

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
    return this.createOne(newChallenge);
  }

  /**
   * Find all challenges within a specific game or generally.
   *
   * @param {any} query the query to filter items
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findAll(gameId?: string): Promise<Challenge[]> {
    if (gameId) {
      return await this.query({});
    } else {
      return await this.query({
        filter: {
          game: { eq: gameId },
        },
      });
    }
  }

  /**
   * Finds a challenge by its ID.
   *
   * @param {string} id of challenge
   * @returns {(Promise<Challenge | undefined>)}
   * @memberof ChallengeService
   */
  async findOne(id: string): Promise<Challenge | undefined> {
    try {
      return await this.getById(id);
    } catch (e) {
      console.error(e);
      console.error('Cannot find a challenge with this id: %s', id);
    }
  }

  /**
   * Find all children-challenges of a specified parent-challenge.
   *
   * @returns {Promise<Challenge[]>} the children-challenges.
   */
  async findChildren(parentId: string): Promise<Challenge[]> {
    return await this.query({
      filter: {
        parentChallenge: { eq: parentId },
      },
    });
  }

  /**
   * Find the challenges by name, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByName(name: string, gameId?: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.query({
        filter: {
          name: { eq: name, like: '%${name}%' },
        },
      });
    } else {
      return await this.query({
        filter: {
          and: [{ name: { eq: name, like: '%${name}%' } }, { game: { eq: gameId } }],
        },
      });
    }
  }

  /**
   * Find the challenges by mode, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByMode(mode: Mode, gameId?: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.query({
        filter: {
          mode: { eq: mode },
        },
      });
    } else {
      return await this.query({
        filter: {
          and: [{ mode: { eq: mode } }, { game: { eq: gameId } }],
        },
      });
    }
  }

  /**
   * Find the challenges by their 'locked' status, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findLocked(locked: boolean, gameId: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.query({
        filter: {
          locked: { is: locked },
        },
      });
    } else {
      return await this.query({
        filter: {
          and: [{ locked: { is: locked } }, { game: { eq: gameId } }],
        },
      });
    }
  }

  /**
   * Find the challenges by their 'hidden' status, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findHidden(hidden: boolean, gameId: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.query({
        filter: {
          hidden: { is: hidden },
        },
      });
    } else {
      return await this.query({
        filter: {
          and: [{ hidden: { is: hidden } }, { game: { eq: gameId } }],
        },
      });
    }
  }
}
