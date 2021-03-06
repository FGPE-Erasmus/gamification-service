import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { FilterQuery, UpdateQuery } from 'mongoose';

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
import { ScheduledHookService } from '../hook/scheduled-hook.service';
import { ConditionEmbed } from '../hook/models/embedded/condition.embed';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { NotificationService } from '../notifications/notification.service';
import { ChallengeToDtoMapper } from './mappers/challenge-to-dto.mapper';

@Injectable()
export class ChallengeService extends BaseService<Challenge, ChallengeDocument> {
  constructor(
    @Inject(forwardRef(() => RewardService)) protected readonly rewardService: RewardService,
    protected readonly repository: ChallengeRepository,
    protected readonly leaderboardService: LeaderboardService,
    protected readonly hookService: HookService,
    protected readonly actionHookService: ActionHookService,
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly notificationService: NotificationService,
    protected readonly challengeToDtoMapper: ChallengeToDtoMapper,
  ) {
    super(new Logger(ChallengeService.name), repository);
  }

  async create(input: Challenge): Promise<Challenge> {
    const result = await super.create(input);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async update(id: string, input: Challenge): Promise<Challenge> {
    const result = await super.update(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async patch(id: string, input: Partial<Challenge>): Promise<Challenge> {
    const result = await super.patch(id, input);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async findOneAndUpdate(
    conditions: FilterQuery<ChallengeDocument>,
    updates: UpdateQuery<ChallengeDocument>,
    options?: Record<string, unknown>,
  ): Promise<Challenge> {
    const result = await super.findOneAndUpdate(conditions, updates, options);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async delete(id: string, soft = false): Promise<Challenge> {
    const result = await super.delete(id, soft);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async deleteOne(conditions: FilterQuery<ChallengeDocument>, options?: Record<string, unknown>): Promise<Challenge> {
    const result = await super.deleteOne(conditions, options);
    this.notificationService.sendNotification(
      NotificationEnum.CHALLENGE_MODIFIED,
      await this.challengeToDtoMapper.transform(result),
    );
    return result;
  }

  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string } },
    rules: any[],
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
        const gedilId = encodedContent.id;
        delete encodedContent.id;
        challenge = await this.create({
          ...encodedContent,
          modeParameters: encodedContent.mode_parameters,
          game: game.id,
          parentChallenge: parentChallenge?.id,
        });
        importTracker.challenges[gedilId] = challenge.id;
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

    // inner challenges
    for (const gedilId of Object.keys(subEntries.challenges)) {
      const newChallenge = await this.importGEdIL(
        importTracker,
        rules,
        game,
        gedilId,
        subEntries.challenges[gedilId],
        challenge,
      );
      importTracker.challenges[gedilId] = newChallenge.id;
    }

    // inner leaderboards
    for (const gedilId of Object.keys(subEntries.leaderboards)) {
      const newLeaderboard = await this.leaderboardService.importGEdIL(
        importTracker,
        rules,
        game,
        subEntries.leaderboards[gedilId],
        challenge,
      );
      importTracker.leaderboards[gedilId] = newLeaderboard.id;
    }

    // inner rewards
    for (const gedilId of Object.keys(subEntries.rewards)) {
      const newReward = await this.rewardService.importGEdIL(
        importTracker,
        rules,
        game,
        subEntries.rewards[gedilId],
        challenge,
      );
      importTracker.rewards[gedilId] = newReward.id;
    }

    // inner rules
    for (const gedilId of Object.keys(subEntries.rules)) {
      rules.push(
        async importTracker =>
          await this.hookService.importGEdIL(importTracker, game, subEntries.rules[gedilId], challenge),
      );
    }

    // add logic hooks of the challenge
    let conditionsList: ConditionEmbed[] = [
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
        leftProperty: Object.keys(subEntries.challenges)
          .map(gedilId => importTracker.challenges[gedilId])
          .join(', '),
        comparingFunction: ComparingFunction.IN,
        rightEntity: EntityEnum.PLAYER,
        rightProperty: `$.learningPath[?(@.state==\'${State.COMPLETED}\')].challenge`,
      },
    ];

    const junctorsList: Junctor[] = [Junctor.AND];

    if (challenge.mode === Mode.SPEEDUP) {
      const speedupCondition: ConditionEmbed = {
        order: 2,
        leftEntity: EntityEnum.FIXED,
        leftProperty: challenge.modeParameters[0],
        comparingFunction: ComparingFunction.GREAT_OR_EQUAL,
        rightEntity: EntityEnum.PLAYER,
        rightProperty: `$.submissions[?(@.game==\'${challenge.game}\' && @.result==\'${Result.ACCEPT}\')].metrics.executionTime`,
      };
      conditionsList.push(speedupCondition);
      junctorsList.push(Junctor.AND);
    } else if (challenge.mode === Mode.SHORTENING) {
      const shorteningConditions: ConditionEmbed[] = this.shorteningConditionCreation(
        challenge.modeParameters,
        challenge.game,
      );
      conditionsList = conditionsList.concat(shorteningConditions);
      junctorsList.push(Junctor.AND);
    }

    for (const exerciseId of challenge.refs) {
      await this.actionHookService.create({
        game: game.id,
        parentChallenge: challenge.id,
        sourceId: exerciseId,
        trigger: TriggerEvent.SUBMISSION_ACCEPTED,
        criteria: {
          conditions: conditionsList,
          junctors: junctorsList,
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
      return [findSubtree(tree, challengeId, 'id', 'children')];
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

  shorteningConditionCreation(modeParameters: string[], gameId: string): ConditionEmbed[] {
    let linesIndex;
    let charsIndex;
    const shorteningConditions: ConditionEmbed[] = [];

    modeParameters.forEach(param => {
      linesIndex =
        Object.keys(param).indexOf('--lines') !== -1
          ? Object.keys(param).indexOf('--lines')
          : Object.keys(param).indexOf('-l');
      charsIndex =
        Object.keys(param).indexOf('--chars') !== -1
          ? Object.keys(param).indexOf('--chars')
          : Object.keys(param).indexOf('-c');
      if (linesIndex !== -1) {
        shorteningConditions.push({
          order: 2,
          leftEntity: EntityEnum.FIXED,
          leftProperty: Object.values(param).toString(),
          comparingFunction: ComparingFunction.GREAT_OR_EQUAL,
          rightEntity: EntityEnum.PLAYER,
          rightProperty: `$.submissions[?(@.game==\'${gameId}\' && @.result==\'${Result.ACCEPT}\')].metrics.linesOfCode`,
        });
      }
      if (charsIndex !== -1) {
        shorteningConditions.push({
          order: 3,
          leftEntity: EntityEnum.FIXED,
          leftProperty: Object.values(param).toString(),
          comparingFunction: ComparingFunction.GREAT_OR_EQUAL,
          rightEntity: EntityEnum.PLAYER,
          rightProperty: `$.submissions[?(@.game==\'${gameId}\' && @.result==\'${Result.ACCEPT}\')].metrics.chars`,
        });
      }
    });
    return shorteningConditions;
  }
}
