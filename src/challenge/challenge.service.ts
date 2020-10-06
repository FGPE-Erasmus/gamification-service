import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { extractToJson } from '../common/utils/extraction.utils';
import { GameDto } from '../game/dto/game.dto';
import { HookService } from '../hook/hook.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';

import { ChallengeRepository } from './repositories/challenge.repository';
import { Challenge } from './models/challenge.model';
import { Mode } from './models/mode.enum';
import { ChallengeInput } from './inputs/challenge.input';
import { ChallengeDto } from './dto/challenge.dto';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';
import { ChallengeToPersistenceMapper } from './mappers/challenge-to-persistence.mapper';

@Injectable()
export class ChallengeService extends BaseService<Challenge, ChallengeInput, ChallengeDto> {
  constructor(
    protected readonly repository: ChallengeRepository,
    protected readonly toDtoMapper: ChallengeToDtoMapper,
    protected readonly toPersistenceMapper: ChallengeToPersistenceMapper,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly rewardService: RewardService,
    protected readonly hookService: HookService,
  ) {
    super(new Logger(ChallengeService.name), repository, toDtoMapper, toPersistenceMapper);
  }

  async importGEdIL(
    game: GameDto,
    gedilId: string,
    entries: { [path: string]: Buffer },
    parentChallenge?: ChallengeDto,
  ): Promise<ChallengeDto | undefined> {
    let challenge: ChallengeDto;

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
   * Find all challenges within a specific game or generally.
   *
   * @param gameId the ID of the game
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByGameId(gameId: string): Promise<ChallengeDto[]> {
    return await this.findAll({
      game: { eq: gameId },
    });
  }

  /**
   * Find all children-challenges of a specified parent-challenge.
   *
   * @returns {Promise<Challenge[]>} the children-challenges.
   */
  async findChildren(parentId: string): Promise<ChallengeDto[]> {
    return await this.findAll({
      parentChallenge: { eq: parentId },
    });
  }

  /**
   * Find the challenges by name, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByName(name: string, gameId?: string): Promise<ChallengeDto[]> {
    if (!gameId) {
      return await this.findAll({
        name: { like: '%${name}%' },
      });
    } else {
      return await this.findAll({
        name: { like: '%${name}%' },
        game: { eq: gameId },
      });
    }
  }

  /**
   * Find the challenges by mode, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByMode(mode: Mode, gameId?: string): Promise<ChallengeDto[]> {
    if (!gameId) {
      return await this.findAll({
        mode: { eq: mode },
      });
    } else {
      return await this.findAll({
        mode: { eq: mode },
        game: { eq: gameId },
      });
    }
  }

  /**
   * Find the challenges by their 'locked' status, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findLocked(locked: boolean, gameId: string): Promise<ChallengeDto[]> {
    if (!gameId) {
      return await this.findAll({
        locked: { is: locked },
      });
    } else {
      return await this.findAll({
        locked: { is: locked },
        game: { eq: gameId },
      });
    }
  }

  /**
   * Find the challenges by their 'hidden' status, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findHidden(hidden: boolean, gameId: string): Promise<ChallengeDto[]> {
    if (!gameId) {
      return await this.findAll({
        hidden: { is: hidden },
      });
    } else {
      return await this.findAll({
        hidden: { is: hidden },
        game: { eq: gameId },
      });
    }
  }
}
