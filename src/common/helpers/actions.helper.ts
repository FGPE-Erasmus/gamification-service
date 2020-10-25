import { StateEnum as State } from 'src/challenge-status/models/state.enum';
import { CategoryEnum as Category } from 'src/hook/enums/category.enum';
import { ActionEmbed } from 'src/hook/models/embedded/action.embed';
import { RewardType } from 'src/reward/models/reward-type.enum';
import { PlayerReward } from 'src/player-reward/models/player-reward.model';
import { Reward } from 'src/reward/models/reward.model';
import { BaseService } from '../services/base.service';
import { Player } from 'src/player/models/player.model';
import { TriggerEventEnum as TriggerEvent } from 'src/hook/enums/trigger-event.enum';
import { EventService } from 'src/event/event.service';
import {
  markAsAvailable,
  markAsCompleted,
  markAsFailed,
  markAsHidden,
  markAsLocked,
  markAsOpen,
  markAsRejected,
} from 'src/challenge-status/challenge-status.service';

export async function runActions(
  actions: ActionEmbed[],
  params: { [key: string]: any },
  services: {
    playerReward: BaseService<PlayerReward>;
    reward: BaseService<Reward>;
    player: BaseService<Player>;
    event: EventService;
  },
): Promise<any> {
  for (const action of actions) {
    const props: { [key: string]: any } = action.parameters;
    switch (action.type) {
      case Category.GIVE:
        await this.runGiveActions(services, props, params.playerId, params.challengeId || null);
        break;
      case Category.TAKE:
        await this.runTakeActions(services, props, params.playerId);
        break;
      case Category.UPDATE:
        await this.runUpdateActions({ player: services.player, event: services.event }, props, params.playerId);
        break;
    }
  }
}

/**
 * Runs actions with type "GIVE", parameters are string arrays with two strings inside.
 * Parameter is structured as ["rewardId/points_nr", quantity].
 * If quantity is not provided - default (1) is applied.
 * @param parameters - string array
 * @param playerId - id of the player
 */
export async function runGiveActions(
  services: {
    playerReward: BaseService<PlayerReward>;
    reward: BaseService<Reward>;
    player: BaseService<Player>;
    event: EventService;
  },
  parameters: { [key: string]: any } | string,
  playerId: string,
  challengeId?: string,
) {
  const quantity: number = parameters[1] ? +parameters[1] : 1;
  if (parameters[0] !== 'points') {
    const reward: Reward = await services.reward.findById(parameters[0]);
    await services.playerReward.findOneAndUpdate(
      {
        player: playerId,
        reward: parameters[0],
      },
      { $inc: { count: quantity } },
      { upsert: true, setDefaultsOnInsert: true },
    );
    if (reward.kind === RewardType.REVEAL) await markAsAvailable(challengeId, playerId);
    else if (reward.kind === RewardType.UNLOCK) await markAsOpen(challengeId, playerId, new Date());
    else {
      //fire REWARD_GRANTED event
      await services.event.fireEvent(TriggerEvent.REWARD_GRANTED, {
        rewardId: parameters[0],
        playerId: playerId,
      });
    }
  } else {
    await services.player.findOneAndUpdate({ _id: playerId }, { $inc: { points: quantity } });
    //fire POINTS-UPDATED event
    await services.event.fireEvent(TriggerEvent.POINTS_UPDATED, {
      playerId: playerId,
    });
  }
}

/**
 * Runs actions with type "TAKE", parameters are string arrays with two strings inside.
 * Parameter is structured as ["rewardId/points_nr", quantity].
 * If quantity is not provided - default (1) is applied.
 * @param parameters - string array
 * @param playerId - id of the player
 */
export async function runTakeActions(
  services: {
    playerReward: BaseService<PlayerReward>;
    reward: BaseService<Reward>;
    player: BaseService<Player>;
    event: EventService;
  },
  parameters: { [key: string]: any } | string,
  playerId: string,
) {
  const quantity: number = parameters[1] ? +parameters[1] : 1;
  if (parameters[0] !== 'points') {
    const x: PlayerReward = await services.playerReward.findOneAndUpdate(
      { player: playerId, reward: parameters[0] },
      { $inc: { count: -quantity } },
      { new: true },
    );
    if (x.count <= 0) {
      await services.playerReward.deleteOne({
        player: playerId,
        reward: parameters,
      });
    }
  } else {
    await services.player.findOneAndUpdate({ _id: playerId }, { $inc: { points: -quantity } }, { new: true });
  }
}

/**
 Runs actions with type "UPDATE", parameters are string arrays with either 3 or 4 arguments.
 * Parameter is structured as ["player or challenge", "challengeId (if challenge)", "prop", "newValue"].
 * @param parameters - string array
 * @param playerId - id of the player
 */
export async function runUpdateActions(
  services: {
    player: BaseService<Player>;
    event: EventService;
  },
  parameters: { [key: string]: any },
  playerId: string,
) {
  if (parameters[0] === 'player') {
    await this.updatePlayer(services, parameters, playerId);
  } else {
    await this.updateChallengeState(parameters, playerId);
  }
}

/**
 * Updates the status of the challenge
 */
export async function updateChallengeState(param: { [key: string]: any }, playerId: string) {
  switch (param[3]) {
    case State.AVAILABLE:
      await markAsAvailable(param[2], playerId);
      break;
    case State.LOCKED:
      await markAsLocked(param[2], playerId);
      break;
    case State.HIDDEN:
      await markAsHidden(param[2], playerId);
      break;
    case State.OPENED:
      await markAsOpen(param[2], playerId, new Date());
      break;
    case State.FAILED:
      await markAsFailed(param[2], playerId, new Date());
      break;
    case State.COMPLETED:
      await markAsCompleted(param[2], playerId, new Date());
      break;
    case State.REJECTED:
      await markAsRejected(param[2], playerId);
      break;
  }
}

/**
 * Updates player properties.
 */
export async function updatePlayer(
  services: {
    player: BaseService<Player>;
    event: EventService;
  },
  param: { [key: string]: any },
  playerId: string,
) {
  switch (param[1]) {
    // more cases can be later added if needed
    case 'points':
      await this.updatePlayerPoints(services, param, playerId);
      break;
  }

  // fire PLAYER_UPDATED event
  await services.event.fireEvent(TriggerEvent.PLAYER_UPDATED, {
    playerId: playerId,
  });
}

/**
 * Updates players points.
 */
export async function updatePlayerPoints(
  services: {
    player: BaseService<Player>;
    event: EventService;
  },
  param: { [key: string]: any },
  playerId: string,
) {
  if (param[2].startsWith('+')) {
    await services.player.findOneAndUpdate({ _id: playerId }, { $inc: { points: +param[2].substring(1) } });
  } else if (param[2].startsWith('-')) {
    await services.player.findOneAndUpdate({ _id: playerId }, { $inc: { points: -param[2].substring(1) } });
  } else {
    await services.player.findOneAndUpdate({ _id: playerId }, { points: +param });
  }

  // fire POINTS_UPDATED event
  await services.event.fireEvent(TriggerEvent.POINTS_UPDATED, {
    playerId: playerId,
  });
}
