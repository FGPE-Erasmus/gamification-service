import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';

import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { PlayerRewardModule } from '../player-reward/player-reward.module';
import { PlayerModule } from '../player/player.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { ActionHookResolver } from './action-hook.resolver';
import { ActionHookService } from './action-hook.service';
import { CategoryEnum } from './enums/category.enum';
import { TriggerEventEnum as TriggerEvent } from './enums/trigger-event.enum';
import { HookService } from './hook.service';
import { ActionHookToDtoMapper } from './mappers/action-hook-to-dto.mapper';
import { ScheduledHookToDtoMapper } from './mappers/scheduled-hook-to-dto.mapper';
import { ActionHook, ActionHookSchema } from './models/action-hook.model';
import { ActionHookRepository } from './repositories/action-hook.repository';
import { ScheduledHookRepository } from './repositories/scheduled-hook.repository';
import { ScheduledHookResolver } from './scheduled-hook.resolver';
import { ScheduledHookService } from './scheduled-hook.service';
import { ScheduledHookSchema } from './models/scheduled-hook.model';
import { ConditionEmbed } from './models/embedded/condition.embed';
import { EntityEnum } from './enums/entity.enum';
import { ComparingFunctionEnum } from './enums/comparing-function.enum';
import { JunctorEnum } from './enums/junctor.enum';
import { Player } from '../player/models/player.model';
import { EventService } from '../event/event.service';
import * as checkCriteria from '../common/helpers/criteria.helper';
import { PlayerService } from '../player/player.service';

const gameId = '440850928599';
const completedExerciseId = '440850928588';

const condition1: ConditionEmbed = {
  order: 0,
  leftEntity: EntityEnum.PLAYER,
  leftProperty: 'POINTS',
  comparingFunction: ComparingFunctionEnum.GREATER_THAN,
  rightEntity: EntityEnum.FIXED,
  rightProperty: '10',
};

const condition2 = {
  order: 1,
  leftEntity: EntityEnum.PLAYER,
  leftProperty: 'SUBMISSIONS',
  comparingFunction: ComparingFunctionEnum.GREATER_THAN,
  rightEntity: EntityEnum.FIXED,
  rightProperty: '10',
};

const testActionHook1 = {
  game: gameId,
  parentChallenge: [],
  trigger: TriggerEvent.REWARD_GRANTED,
  sourceId: completedExerciseId,
  criteria: {
    conditions: [condition1, condition2],
    junctors: [JunctorEnum.AND],
  },
  actions: [
    {
      type: CategoryEnum.UPDATE,
      parameters: ['440850928577'],
    },
  ],
  recurrent: false,
  active: true,
  lastRun: new Date(),
};

const testActionHook2 = {
  game: gameId,
  parentChallenge: [],
  trigger: TriggerEvent.SUBMISSION_ACCEPTED,
  sourceId: null,
  criteria: null,
  actions: [
    {
      type: CategoryEnum.UPDATE,
      parameters: ['CHALLENGE', '440850928556', '440850928567', 'STATE', 'completed'],
    },
  ],
  recurrent: true,
  active: false,
  lastRun: new Date(),
};

const testPlayer1 = {
  user: '440850928566',
  game: gameId,
  points: 123,
  submissions: ['440850928555', '440850928544'],
  learningPath: ['440850928533'],
  rewards: ['440850928522'],
};

describe('HookService', () => {
  let connection: Connection;
  let service: HookService;
  let playerService: PlayerService;
  let actionHookService: ActionHookService;
  let almightyActionHook: ActionHook;
  let mysteriousActionHook: ActionHook;
  let playerYoda: Player;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forFeature([
          {
            name: 'ActionHook',
            schema: ActionHookSchema,
          },
          {
            name: 'ScheduledHook',
            schema: ScheduledHookSchema,
          },
        ]),
        forwardRef(() => GameModule),
        forwardRef(() => ChallengeModule),
        forwardRef(() => ChallengeStatusModule),
        forwardRef(() => PlayerModule),
        forwardRef(() => RewardModule),
        forwardRef(() => PlayerRewardModule),
        forwardRef(() => SubmissionModule),
        forwardRef(() => EventModule),
        forwardRef(() => SubscriptionsModule),
        DbTestModule({}),
      ],
      providers: [
        ActionHookToDtoMapper,
        ScheduledHookToDtoMapper,
        ActionHookRepository,
        ScheduledHookRepository,
        HookService,
        ActionHookService,
        ScheduledHookService,
        ActionHookResolver,
        ScheduledHookResolver,
      ],
    }).compile();
    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<HookService>(HookService);
    actionHookService = module.get<ActionHookService>(ActionHookService);
    playerService = module.get<PlayerService>(PlayerService);
  });

  beforeEach(async () => {
    await cleanupMongo('ActionHook');
    await cleanupMongo('Player');
    almightyActionHook = await actionHookService.create(testActionHook1);
    mysteriousActionHook = await actionHookService.create(testActionHook2);
    playerYoda = await playerService.create(testPlayer1);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should find a defined hook by its id', async () => {
      const foundHook = await service.findById(almightyActionHook.id);
      expect(foundHook).toBeDefined;
    });

    it('should find the hook by its id', async () => {
      const foundHook = await service.findById(almightyActionHook.id);
      expect(foundHook).toEqual(expect.objectContaining(testActionHook1));
    });
  });

  describe('findByGame', () => {
    it('should find the hook by the id of the game', async () => {
      const foundHooks = await actionHookService.findByGameId(gameId);
      expect(foundHooks).toEqual(expect.objectContaining([almightyActionHook, mysteriousActionHook]));
    });
  });

  describe('executeHook', () => {
    it('should give a reward', async () => {
      const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFireEvent.mockImplementation(async () => {});

      const mockCheckCriteria = jest.spyOn(checkCriteria, 'checkCriteria');
      mockCheckCriteria.mockImplementation(async () => {
        return true;
      });

      const execution = service.executeHook(almightyActionHook, { playerId: playerYoda.id }, {});
      expect(execution).toHaveReturned();
    });

    it('should update the status of the challenge', async () => {
      const mockFireEvent = jest.spyOn(EventService.prototype, 'fireEvent');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFireEvent.mockImplementation(async () => {});

      const mockCheckCriteria = jest.spyOn(checkCriteria, 'checkCriteria');
      mockCheckCriteria.mockImplementation(async () => {
        return true;
      });

      const execution = service.executeHook(mysteriousActionHook, { playerId: playerYoda.id }, {});
      expect(execution).toHaveReturned();
    });
  });
});
