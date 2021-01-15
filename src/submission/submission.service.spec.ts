import { forwardRef } from '@nestjs/common';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { TestingModule, Test } from '@nestjs/testing';
import { Connection } from 'mongoose';

import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';
import { EventModule } from '../event/event.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { SubmissionToDtoMapper } from './mappers/submission-to-dto.mapper';
import { Submission, SubmissionSchema } from './models/submission.model';
import { SubmissionRepository } from './repositories/submission.repository';
import { SubmissionResolver } from './submission.resolver';
import { SubmissionService } from './submission.service';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { EvaluationEngine } from './models/evaluation-engine.enum';
import { Result } from './models/result.enum';
import { PlayerService } from '../player/player.service';
import { Player } from '../player/models/player.model';
import { EventService } from '../event/event.service';
import { EvaluationEngineService } from '../evaluation-engine/evaluation-engine.service';

const gameId = '440850928599';
const playerYoda = '440850928500';
const playerVader = '440850928502';

const testSub1 = {
  game: gameId,
  player: playerYoda,
  exerciseId: 'A',
};

const testSub2 = {
  game: gameId,
  player: playerVader,
  exerciseId: 'B',
  evaluationEngine: EvaluationEngine.MOOSHAK,
  evaluationEngineId: '440850928591',
  language: 'Java',
  metrics: null,
  result: Result.ACCEPT,
  grade: 4,
  feedback: 'Good job',
  submittedAt: new Date(),
  evaluatedAt: new Date(),
};

describe('SubmissionService', () => {
  let connection: Connection;
  let service: SubmissionService;
  let darkSubmission: Submission;
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  let lightSubmission: Submission;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DbTestModule({}),
        MongooseModule.forFeature([
          {
            name: 'Submission',
            schema: SubmissionSchema,
          },
        ]),
        forwardRef(() => EventModule),
        forwardRef(() => EvaluationEngineModule) /**/,
        forwardRef(() => GameModule),
        forwardRef(() => PlayerModule),
        /*forwardRef(() => HookModule),
        forwardRef(() => ChallengeStatusModule),
        forwardRef(() => SubscriptionsModule),*/
      ],
      providers: [SubmissionToDtoMapper, SubmissionRepository, SubmissionService, SubmissionResolver],
    }).compile();
    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<SubmissionService>(SubmissionService);
  });

  beforeEach(async () => {
    await cleanupMongo('Submission');
    lightSubmission = await service.create(testSub1);
    darkSubmission = await service.create(testSub2);
  });

  afterAll(async () => {
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create two submissions', async () => {
      const foundSubmissions = await service.findAll();
      expect(foundSubmissions.length).toEqual(2);
    });
  });

  describe('findByUser', () => {
    it('should find the submission by user id', async () => {
      const player: Player = {
        id: playerVader,
        user: 'Vader',
        game: gameId,
      };
      const mockFind = jest.spyOn(PlayerService.prototype, 'findByGameAndUser');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFind.mockImplementation(async () => {
        return player;
      });

      const foundSubmission = await service.findByUser(gameId, player.user);
      expect(foundSubmission).toEqual([darkSubmission]);
    });
  });

  describe('sendSubmission', () => {
    it('should return submission object', async () => {
      const mockFindOne = jest.spyOn(EventService.prototype, 'fireEvent');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockFindOne.mockImplementation(async () => {});

      const mockEval = jest.spyOn(EvaluationEngineService.prototype, 'evaluate');
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      mockEval.mockImplementation(async () => {});

      const submission: Submission = await service.evaluate(gameId, 'A', playerYoda, {
        filename: 'TEST',
        content: null,
      });
      expect(submission.id).toBeDefined();
    });
  });
});
