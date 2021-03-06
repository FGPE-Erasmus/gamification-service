import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

import { checkCriteria } from '../common/helpers/criteria.helper';
import { extractToJson } from '../common/utils/extraction.utils';
import { NotificationEnum } from '../common/enums/notifications.enum';
import { PlayerRewardToDtoMapper } from '../player-reward/mappers/player-reward-to-dto.mapper';
import { ChallengeStatusService } from '../challenge-status/challenge-status.service';
import { Challenge } from '../challenge/models/challenge.model';
import { ChallengeStatus } from '../challenge-status/models/challenge-status.model';
import { StateEnum as State } from '../challenge-status/models/state.enum';
import { EventService } from '../event/event.service';
import { Game } from '../game/models/game.model';
import { RewardToDtoMapper } from '../reward/mappers/reward-to-dto.mapper';
import { CategoryEnum as Category } from '../hook/enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from '../hook/enums/trigger-event.enum';
import { TriggerKindEnum as TriggerKind } from './enums/trigger-kind.enum';
import { PlayerRewardService } from '../player-reward/player-reward.service';
import { PlayerService } from '../player/player.service';
import { PlayerReward } from '../player-reward/models/player-reward.model';
import { Reward } from '../reward/models/reward.model';
import { RewardService } from '../reward/reward.service';
import { SubmissionService } from '../submission/submission.service';
import { ScheduledHookService } from './scheduled-hook.service';
import { ActionHookService } from './action-hook.service';
import { ConditionInput } from './inputs/condition.input';
import { ScheduledHook } from './models/scheduled-hook.model';
import { ActionHook } from './models/action-hook.model';
import { ActionEmbed } from './models/embedded/action.embed';
import { ChallengeService } from '../challenge/challenge.service';
import { Player } from '../player/models/player.model';
import { PlayerToDtoMapper } from '../player/mappers/player-to-dto.mapper';
import { NotificationService } from '../notifications/notification.service';
import { GameService } from '../game/game.service';
import { GameStateEnum } from '../game/enum/game-state.enum';
import { GameToDtoMapper } from '../game/mappers/game-to-dto.mapper';

@Injectable()
export class HookService {
  protected readonly logger = new Logger(HookService.name);

  constructor(
    @Inject('PUB_SUB') protected readonly pubSub: PubSub,
    @Inject(forwardRef(() => ChallengeService)) protected readonly challengeService: ChallengeService,
    @Inject(forwardRef(() => PlayerService)) protected readonly playerService: PlayerService,
    @Inject(forwardRef(() => RewardService)) protected readonly rewardService: RewardService,
    @Inject(forwardRef(() => GameService)) protected readonly gameService: GameService,
    protected readonly actionHookService: ActionHookService,
    protected readonly scheduledHookService: ScheduledHookService,
    protected readonly challengeStatusService: ChallengeStatusService,
    protected readonly playerRewardService: PlayerRewardService,
    protected readonly submissionService: SubmissionService,
    protected readonly eventService: EventService,
    protected readonly notificationService: NotificationService,
    protected readonly rewardToDtoMapper: RewardToDtoMapper,
    protected readonly playerRewardToDtoMapper: PlayerRewardToDtoMapper,
    protected readonly playerToDtoMapper: PlayerToDtoMapper,
    protected readonly gameToDtoMapper: GameToDtoMapper,
  ) {}

  async importGEdIL(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string } },
    game: Game,
    entries: { [path: string]: Buffer },
    parentChallenge?: Challenge,
  ): Promise<void> {
    for (const path of Object.keys(entries)) {
      const encodedContent = extractToJson(entries[path]);
      const triggers = encodedContent.triggers;
      for (const trigger of triggers) {
        let sourceIds;
        if (trigger.event.startsWith('CHALLENGE_')) {
          sourceIds = trigger.parameters.map(gedilId => importTracker.challenges[gedilId].toString());
          trigger.parameters = sourceIds;
        } else if (trigger.event.startsWith('REWARD_')) {
          sourceIds = trigger.parameters.map(gedilId => importTracker.rewards[gedilId].toString());
          trigger.parameters = sourceIds;
        }
        for (const action of encodedContent.actions) {
          if (action.parameters) {
            action.parameters = action.parameters.map(param => {
              if (importTracker.rewards[param]) {
                return importTracker.rewards[param];
              } else if (importTracker.challenges[param]) {
                return importTracker.challenges[param];
              }
              return param;
            });
          }
        }

        const data: { [key: string]: any } = {
          game: game.id?.toString(),
          parentChallenge: parentChallenge?.id?.toString(),
          criteria: {
            conditions: HookService.transformConditions(encodedContent.criteria.conditions, importTracker),
            junctors: encodedContent.criteria.junctors || [],
          },
          actions: encodedContent.actions,
          recurrent: trigger.recurrent,
          active: true,
        };
        if (trigger.kind === TriggerKind.ACTION) {
          await this.actionHookService.create({
            ...data,
            trigger: trigger.event,
            sourceId: trigger.parameters[0],
          } as ActionHook);
        } else if (trigger.kind === TriggerKind.SCHEDULED) {
          if (trigger.event === 'INTERVAL') {
            data.interval = parseInt(trigger.parameters[0]);
          } else {
            data.cron = trigger.parameters[0];
          }
          await this.scheduledHookService.create({
            ...data,
          } as ScheduledHook);
        }
      }
    }
  }

  /**
   * Find all hooks within a specific game.
   *
   * @param gameId the ID of the game
   * @returns {Promise<Challenge[]>} the challenges.
   */
  async findByGameId(gameId: string): Promise<(ActionHook | ScheduledHook)[]> {
    return [
      ...(await this.actionHookService.findByGameId(gameId)),
      ...(await this.scheduledHookService.findByGameId(gameId)),
    ];
  }

  /**
   * Finds an hook by its ID.
   *
   * @param {string} id of the hook
   * @returns {(Promise<ActionHook | ScheduledHook | undefined>)}
   * @memberOf ChallengeService
   */
  async findById(id: string): Promise<ActionHook | ScheduledHook | undefined> {
    let hook: ActionHook | ScheduledHook = await this.actionHookService.findById(id);
    if (!hook) {
      hook = await this.scheduledHookService.findById(id);
    }
    return hook;
  }

  /**
   * Execute a specific hook.
   *
   * @param hook
   * @param eventParams
   * @param actionObj
   */
  async executeHook(
    hook: ActionHook | ScheduledHook,
    eventParams: { [key: string]: any },
    actionObj?: { [key: string]: any },
  ): Promise<void> {
    const meet = await checkCriteria(hook.criteria, eventParams, actionObj, {
      player: (id: string) =>
        this.playerService.findById(id, undefined, { lean: true, populate: 'submissions learningPath rewards' }),
      submissions: () => this.submissionService.findAll({ game: { $eq: hook.game } }, undefined, { lean: true }),
      players: () =>
        this.playerService.findAll({ game: { $eq: hook.game } }, undefined, {
          lean: true,
          populate: 'submissions learningPath rewards',
        }),
    });
    if (meet) {
      await this.runActions(hook.game, hook.actions, eventParams);
    }
  }

  /** Helpers **/

  /**
   * Run actions of an hook.
   *
   * @param {string} gameId ID of the game
   * @param {ActionEmbed[]} actions Actions of the hook
   * @param {[key: string]: any} eventParams Parameters of the event
   */
  private async runActions(gameId: string, actions: ActionEmbed[], eventParams: { [key: string]: any }): Promise<any> {
    for (const action of actions) {
      switch (action.type) {
        case Category.GIVE:
          try {
            await this.runGiveActions(gameId, eventParams.playerId?.toString(), action.parameters);
          } catch (err) {
            this.logger.error(
              `Ecountered an error while granting an object of type/id ${action.parameters[0]}: ${err}`,
            );
          }
          break;
        case Category.TAKE:
          try {
            await this.runTakeActions(gameId, eventParams.playerId?.toString(), action.parameters);
          } catch (err) {
            this.logger.error(
              `Ecountered an error while withdrawing an object of type ${action.parameters[0]}: ${err}`,
            );
          }
          break;
        case Category.UPDATE:
          try {
            await this.runUpdateActions(gameId, eventParams.playerId?.toString(), action.parameters);
          } catch (err) {
            this.logger.error(`Ecountered an error while updating an object of type ${action.parameters[0]}: ${err}`);
          }
          break;
      }
    }
  }

  /**
   * Runs actions with type "GIVE", parameters are string arrays with two
   * strings inside. If quantity is not provided, default (1) is applied.
   *
   * @param {string} gameId ID of the game
   * @param {string} playerId ID of the player
   * @param {string[]} parameters Parameters of the event
   */
  private async runGiveActions(gameId: string, playerId: string, parameters: string[]): Promise<void> {
    if (parameters[0].toUpperCase() !== 'POINTS') {
      const reward: Reward = await this.rewardService.findById(parameters[0]);
      const playerReward: PlayerReward = await this.playerRewardService.findOne({
        player: playerId,
        reward: reward.id,
      });

      if (playerReward && !reward.recurrent) {
        // player already has the reward and it is not accumulative
        return;
      } else if (playerReward) {
        // player already has the reward and it is accumulative
        const quantity: number = playerReward.count + (parameters[1] ? +parameters[1] : 1);
        await this.playerRewardService.patch(playerReward.id, { count: quantity });
        this.notificationService.sendNotification(
          NotificationEnum.REWARD_RECEIVED,
          await this.playerRewardToDtoMapper.transform(playerReward),
          gameId,
        );
      } else {
        // player does not have the reward
        const createdPlayerReward: PlayerReward = await this.playerRewardService.create({
          player: playerId,
          reward: reward.id,
          count: reward.recurrent && parameters[1] ? +parameters[1] : 1,
        });
        this.notificationService.sendNotification(
          NotificationEnum.REWARD_RECEIVED,
          await this.playerRewardToDtoMapper.transform(createdPlayerReward),
          gameId,
        );
      }

      // send REWARD_GRANTED event
      await this.eventService.fireEvent(TriggerEvent.REWARD_GRANTED, {
        gameId,
        playerId,
        rewardId: reward.id,
      });
    } else {
      const quantity: number = parameters[1] ? +parameters[1] : 1;
      const updatedPointsPlayer: Player = await this.playerService.findOneAndUpdate(
        { _id: playerId },
        { $inc: { points: quantity } },
      );
      this.notificationService.sendNotification(
        NotificationEnum.POINTS_UPDATED,
        await this.playerToDtoMapper.transform(updatedPointsPlayer),
      );

      // send POINTS_UPDATED event
      await this.eventService.fireEvent(TriggerEvent.POINTS_UPDATED, {
        gameId,
        playerId,
      });
    }
  }

  /**
   * Runs actions with type "TAKE", parameters are string arrays with two strings inside.
   * Parameter is structured as ["rewardId/points_nr", quantity].
   * If quantity is not provided - default (1) is applied.
   *
   * @param {string} gameId ID of the game
   * @param {string} playerId ID of the player
   * @param {string[]} parameters Parameters of the event
   */
  private async runTakeActions(gameId: string, playerId: string, parameters: { [key: string]: any } | string) {
    if (parameters[0].toUpperCase() !== 'POINTS') {
      const quantity: number = parameters[1] ? +parameters[1] : 1;
      const playerReward: PlayerReward = await this.playerRewardService.findOneAndUpdate(
        { player: playerId, reward: parameters[0] },
        { $inc: { count: -quantity } },
        { new: true },
      );
      this.notificationService.sendNotification(
        NotificationEnum.REWARD_SUBSTRACTED,
        await this.playerRewardToDtoMapper.transform(playerReward),
        gameId,
      );
      if (playerReward.count <= 0) {
        await this.playerRewardService.deleteOne({
          player: playerId,
          reward: parameters,
        });
        this.notificationService.sendNotification(
          NotificationEnum.REWARD_REMOVED,
          await this.playerRewardToDtoMapper.transform(playerReward),
          gameId,
        );
      }
    } else {
      const quantity: number = parameters[1] ? +parameters[1] : 1;
      const updatedPointsPlayer: Player = await this.playerService.findOneAndUpdate(
        { _id: playerId },
        { $inc: { points: -quantity } },
        { new: true },
      );
      this.notificationService.sendNotification(
        NotificationEnum.POINTS_UPDATED,
        await this.playerToDtoMapper.transform(updatedPointsPlayer),
      );
    }
  }

  /**
   * Runs actions with type "UPDATE", parameters are string arrays with either
   * 3 or 4 arguments.
   *
   * @param {string} gameId ID of the game
   * @param {string} playerId ID of the player
   * @param {string[]} parameters Parameters of the event
   */
  private async runUpdateActions(gameId: string, playerId: string, parameters: string[]) {
    switch (parameters[0].toUpperCase()) {
      case 'PLAYER':
        return await this.updatePlayer(gameId, playerId, parameters[1], parameters[2]);
      case 'CHALLENGE':
        return await this.updateChallenge(gameId, parameters[1], playerId, parameters[2], parameters[3]);
      case 'GAME':
        return await this.updateGame(gameId, parameters[1], parameters[2]);
    }
  }

  private async updateGame(gameId: string, property: string, value: string): Promise<Game> {
    let game: Game;
    switch (property.toUpperCase()) {
      case 'STATE':
        switch (value.toUpperCase()) {
          case GameStateEnum.CLOSED:
            game = await this.gameService.findOneAndUpdate(
              { _id: gameId },
              { state: GameStateEnum.CLOSED },
              { new: true },
            );
            this.notificationService.sendNotification(
              NotificationEnum.GAME_FINISHED,
              await this.gameToDtoMapper.transform(game),
            );
            return game;
          case GameStateEnum.LOCKED:
            game = await this.gameService.findOneAndUpdate(
              { _id: gameId },
              { state: GameStateEnum.LOCKED },
              { new: true },
            );
            return game;
          case GameStateEnum.OPEN:
            game = await this.gameService.findOneAndUpdate(
              { _id: gameId },
              { state: GameStateEnum.OPEN },
              { new: true },
            );
            this.notificationService.sendNotification(
              NotificationEnum.GAME_STARTED,
              await this.gameToDtoMapper.transform(game),
            );
            return game;
        }
    }
  }

  /**
   * Update a property of the challenge.
   *
   * @param {string} gameId ID of the game
   * @param {string} challengeId ID of the challenge.
   * @param {string} playerId ID of the player.
   * @param {string} property Property of the challenge to update.
   * @param {string} value New value for the property.
   * @returns {Promise<ChallengeStatus>}
   */
  private async updateChallenge(
    gameId: string,
    challengeId: string,
    playerId: string,
    property: string,
    value: string,
  ): Promise<ChallengeStatus | Challenge> {
    switch (property.toUpperCase()) {
      case 'STATE':
        return this.updateChallengeState(gameId, challengeId, playerId, State[value.toUpperCase()]);
    }
  }

  /**
   * Updates the status of the challenge
   *
   * @param {string} gameId ID of the game
   * @param {string} challengeId ID of the challenge.
   * @param {string} playerId ID of the player.
   * @param {State} state New state.
   */
  private async updateChallengeState(
    gameId: string,
    challengeId: string,
    playerId: string,
    state: State,
  ): Promise<ChallengeStatus> {
    switch (state) {
      case State.AVAILABLE:
        return await this.challengeStatusService.markAsAvailable(gameId, challengeId, playerId);
      case State.LOCKED:
        return await this.challengeStatusService.markAsLocked(gameId, challengeId, playerId);
      case State.HIDDEN:
        return await this.challengeStatusService.markAsHidden(gameId, challengeId, playerId);
      case State.OPENED:
        return await this.challengeStatusService.markAsOpen(gameId, challengeId, playerId, new Date());
      case State.FAILED:
        return await this.challengeStatusService.markAsFailed(gameId, challengeId, playerId, new Date());
      case State.COMPLETED:
        return await this.challengeStatusService.markAsCompleted(gameId, challengeId, playerId, new Date());
      case State.REJECTED:
        return await this.challengeStatusService.markAsRejected(gameId, challengeId, playerId, new Date());
    }
  }

  /**
   * Updates player properties.
   *
   * @param {string} gameId ID of the game
   * @param {string} playerId ID of the player.
   * @param {string} property Property of the challenge to update.
   * @param {string} value New value for the property.
   */
  private async updatePlayer(gameId: string, playerId: string, property: string, value: string) {
    switch (property.toUpperCase()) {
      case 'POINTS':
        await this.updatePlayerPoints(gameId, playerId, value);
        break;
    }

    // send PLAYER_UPDATED event
    await this.eventService.fireEvent(TriggerEvent.PLAYER_UPDATED, {
      gameId,
      playerId: playerId,
    });
  }

  /**
   * Update player's points.
   *
   * @param {string} gameId ID of the game
   * @param {string} playerId ID of the player.
   * @param {string} points Amount of points to update as a change string.
   */
  private async updatePlayerPoints(gameId: string, playerId: string, points: string): Promise<void> {
    let updatedPlayer: Player;
    if (points.startsWith('+')) {
      updatedPlayer = await this.playerService.findOneAndUpdate(
        { _id: playerId },
        { $inc: { points: +points.substring(1) } },
      );
    } else if (points.startsWith('-')) {
      updatedPlayer = await this.playerService.findOneAndUpdate(
        { _id: playerId },
        { $inc: { points: -points.substring(1) } },
      );
    } else {
      updatedPlayer = await this.playerService.findOneAndUpdate({ _id: playerId }, { points: +points });
    }
    this.notificationService.sendNotification(
      NotificationEnum.POINTS_UPDATED,
      await this.playerToDtoMapper.transform(updatedPlayer),
    );
    // send POINTS_UPDATED event
    await this.eventService.fireEvent(TriggerEvent.POINTS_UPDATED, {
      gameId,
      playerId: playerId,
    });
  }

  private static transformConditions(
    data: [{ [key: string]: any }],
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string } },
  ): ConditionInput[] {
    if (!data) {
      return [];
    }
    return data.map(condition => ({
      order: condition.order,
      leftEntity: condition.left_entity,
      leftProperty: this.replaceGedilIds(importTracker, condition.left_property),
      comparingFunction: condition.comparing_function,
      rightEntity: condition.right_entity,
      rightProperty: this.replaceGedilIds(importTracker, condition.right_property),
    }));
  }

  private static replaceGedilIds(
    importTracker: { [t in 'challenges' | 'leaderboards' | 'rewards']: { [k: string]: string } },
    target: string,
  ): string {
    if (!target) {
      return target;
    }
    const uuidv4 = /([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12})/i;
    let result;
    while ((result = uuidv4.exec(target)) !== null) {
      if (importTracker.challenges[result[0]]) {
        target = target.replace(new RegExp(result[0], 'g'), importTracker.challenges[result[0]]);
      } else if (importTracker.leaderboards[result[0]]) {
        target = target.replace(new RegExp(result[0], 'g'), importTracker.leaderboards[result[0]]);
      } else if (importTracker.rewards[result[0]]) {
        target = target.replace(new RegExp(result[0], 'g'), importTracker.rewards[result[0]]);
      } else {
        break;
      }
    }
    return target;
  }
}
