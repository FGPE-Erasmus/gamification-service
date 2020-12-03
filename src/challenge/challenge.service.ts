import { Injectable, Logger } from '@nestjs/common';

import { BaseService } from '../common/services/base.service';
import { flatten } from '../common/utils/array.utils';
import { extractToJson } from '../common/utils/extraction.utils';
import { collectFromTree, createTree, findSubtree } from '../common/utils/tree.utils';
import { StateEnum as State } from '../challenge-status/models/state.enum';
import { Game } from '../game/models/game.model';
import { ActionHookService } from '../hook/action-hook.service';
import { ComparingFunctionEnum as ComparingFunction } from '../hook/enums/comparing-function.enum';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { EntityEnum } from '../hook/enums/entity.enum';
import { JunctorEnum as Junctor } from '../hook/enums/junctor.enum';
import { HookService } from '../hook/hook.service';
import { CategoryEnum } from '../hook/enums/category.enum';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { RewardService } from '../reward/reward.service';
import { Result } from '../submission/models/result.enum';

import { Challenge, ChallengeDocument } from './models/challenge.model';
import { Mode } from './models/mode.enum';
import { ChallengeRepository } from './repositories/challenge.repository';

@Injectable()
export class ChallengeService extends BaseService<Challenge, ChallengeDocument> {
  constructor(
    protected readonly repository: ChallengeRepository,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly rewardService: RewardService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
  ) {
    super(new Logger(ChallengeService.name), repository);
  }

  async importGEdIL(
    imported: { [t in 'challenges' | 'leaderboards' | 'rewards' | 'rules']: { [k: string]: string } },
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
        delete encodedContent.id;
        challenge = await this.create({
          ...encodedContent,
          modeParameters: encodedContent.mode_parameters,
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
      subObjects.challenges[gedilId] = await this.importGEdIL(
        imported,
        game,
        gedilId,
        subEntries.challenges[gedilId],
        challenge,
      );
    }

    // inner leaderboards
    for (const gedilId of Object.keys(subEntries.leaderboards)) {
      subObjects.leaderboards[gedilId] = await this.leaderboardService.importGEdIL(
        imported,
        game,
        subEntries.leaderboards[gedilId],
        challenge,
      );
    }

    // inner rewards
    for (const gedilId of Object.keys(subEntries.rewards)) {
      subObjects.rewards[gedilId] = await this.rewardService.importGEdIL(
        imported,
        game,
        subEntries.rewards[gedilId],
        challenge,
      );
    }

    // inner rules
    for (const gedilId of Object.keys(subEntries.rules)) {
      subObjects.rules[gedilId] = await this.hookService.importGEdIL(
        imported,
        game,
        subEntries.rules[gedilId],
        challenge,
      );
    }

    // add logic hooks of the challenge
    for (const exerciseId of challenge.refs) {
      await this.actionHookService.create({
        game: game.id,
        parentChallenge: challenge.id,
        sourceId: exerciseId,
        trigger: TriggerEvent.SUBMISSION_ACCEPTED,
        criteria: {
          conditions: [
            {
              order: 0,
              leftEntity: EntityEnum.FIXED,
              leftProperty: challenge.refs.join(', '),
              comparingFunction: ComparingFunction.IN,
              rightEntity: EntityEnum.PLAYER,
              rightProperty: `$.submissions[?(@.result==\'${Result.ACCEPT}\')].exerciseId`,
            },
            {
              order: 1,
              leftEntity: EntityEnum.FIXED,
              leftProperty: Object.values(subObjects.challenges).join(', '),
              comparingFunction: ComparingFunction.IN,
              rightEntity: EntityEnum.PLAYER,
              rightProperty: `$.learningPath[?(@.state==\'${State.COMPLETED}\')].challenge`,
            },
          ],
          junctors: [Junctor.AND],
        },
        actions: [
          {
            type: CategoryEnum.UPDATE,
            parameters: ['CHALLENGE', challenge.id as string, 'STATE', State.COMPLETED],
          },
        ],
        recurrent: true,
        active: true,
      });
    }

    return challenge;
  }

  /**
   * Find all challenges within a specific game.
   *
   * @param gameId the ID of the game
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByGameId(gameId: string): Promise<Challenge[]> {
    return await this.findAll({
      game: { $eq: gameId },
    });
  }

  /**
   * Find all challenges within a specific parent challenge.
   *
   * @param gameId the ID of the game
   * @param parentChallengeId the ID of the par
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByParentChallengeId(gameId: string, parentChallengeId: string): Promise<Challenge[]> {
    return await this.findAll({
      game: { $eq: gameId },
      parentChallenge: { $eq: parentChallengeId },
    });
  }

  /**
   * Get the challenge tree of a game.
   *
   * @param gameId the ID of the game.
   * @param challengeId the ID of the challenge to return a sub-tree.
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async challengeTree(gameId: string, challengeId?: string): Promise<(Challenge & { children: any })[]> {
    const challenges = await this.findByGameId(gameId);
    const tree: (Challenge & { children: any })[] = createTree(challenges, 'id', 'parentChallenge', 'children');
    if (challengeId) {
      return findSubtree(tree, challengeId, 'id', 'children');
    }
    return tree;
  }

  /**
   * Get the challenge tree of a game.
   *
   * @param gameId the ID of the game.
   * @param challengeId the ID of the challenge (to return a sub-tree).
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async getExercises(gameId: string, challengeId?: string): Promise<string[]> {
    const tree = await this.challengeTree(gameId, challengeId);
    return flatten(collectFromTree(tree, 'refs'));
  }

  /**
   * Find the challenges by name, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByName(name: string, gameId?: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.findAll({
        name: { $regex: `.*${name}.*` },
      });
    } else {
      return await this.findAll({
        $and: [{ name: { $regex: `.*${name}.*` } }, { game: { $eq: gameId } }],
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
      return await this.findAll({
        mode: { $eq: mode },
      });
    } else {
      return await this.findAll({
        $and: [{ mode: { $eq: mode } }, { game: { $eq: gameId } }],
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
      return await this.findAll({
        locked: { $eq: locked },
      });
    } else {
      return await this.findAll({
        $and: [{ locked: { $eq: locked } }, { game: { $eq: gameId } }],
      });
    }
  }

  /**
   * Find the challenges by their 'hidden' status, within a game or generally.
   *
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findHidden(hidden: boolean, gameId?: string): Promise<Challenge[]> {
    if (!gameId) {
      return await this.findAll({
        hidden: { $eq: hidden },
      });
    } else {
      return await this.findAll({
        $and: [{ hidden: { $eq: hidden } }, { game: { $eq: gameId } }],
      });
    }
  }
}
