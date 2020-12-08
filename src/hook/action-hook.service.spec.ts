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

const gameId = '440850928599';
const completedExerciseId = '440850928588';

const testActionHook1 = {
  game: gameId,
  parentChallenge: [],
  trigger: TriggerEvent.REWARD_GRANTED,
  sourceId: completedExerciseId,
  criteria: null,
  actions: [
    {
      type: CategoryEnum.GIVE,
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
  trigger: TriggerEvent.SUBMISSION_REJECTED,
  sourceId: null,
  criteria: null,
  actions: [
    {
      type: CategoryEnum.TAKE,
      parameters: ['POINTS', '123'],
    },
  ],
  recurrent: true,
  active: false,
  lastRun: new Date(),
};

describe('ActionHookService', () => {
  let connection: Connection;
  let service: ActionHookService;
  let almightyActionHook: ActionHook;
  let mysteriousActionHook: ActionHook;

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
    service = module.get<ActionHookService>(ActionHookService);
  });

  beforeEach(async () => {
    await cleanupMongo('ActionHook');
    almightyActionHook = await service.create(testActionHook1);
    mysteriousActionHook = await service.create(testActionHook2);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create 1st action hook', () => {
      expect(almightyActionHook).toEqual(expect.objectContaining(testActionHook1));
    });

    it('should create 2nd action hook', () => {
      expect(mysteriousActionHook).toEqual(expect.objectContaining(testActionHook2));
    });
  });

  describe('findAll', () => {
    it('should find all action hooks', async () => {
      const foundHooks = await service.findAll();
      expect(foundHooks).toEqual(expect.objectContaining([almightyActionHook, mysteriousActionHook]));
    });
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
      const foundHooks = await service.findByGameId(gameId);
      expect(foundHooks).toEqual(expect.objectContaining([almightyActionHook, mysteriousActionHook]));
    });
  });
});
