import { forwardRef } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { ChallengeModule } from '../challenge/challenge.module';
import { LeaderboardModule } from '../leaderboard/leaderboard.module';
import { HookModule } from '../hook/hook.module';
import { RewardModule } from '../reward/reward.module';
import { SubmissionModule } from '../submission/submission.module';
import { GameService } from './game.service';
import { Game, GameSchema } from './models/game.model';
import { GameRepository } from './repositories/game.repository';
import * as fs from 'fs';
import { Readable } from 'stream';
import { ChallengeService } from '../challenge/challenge.service';
import { RewardService } from '../reward/reward.service';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { HookService } from '../hook/hook.service';
import { toMongoId } from '../common/utils/mongo.utils';
import KeycloakMockService from '../../test/__mocks__/keycloak.service';
import { KeycloakService } from '../keycloak/keycloak.service';
import { KeycloakModule } from '../keycloak/keycloak.module';

const GEDIL_FILE = 'test/resources/gedil/the-a-run-gedil.zip';

jest.mock('../keycloak/keycloak.service');

describe('GameService', () => {
  let connection: Connection;
  let service: GameService;
  let challengeService: ChallengeService;
  let rewardService: RewardService;
  let leaderboardService: LeaderboardService;
  let hookService: HookService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DbTestModule({}),
        MongooseModule.forFeature([{ name: 'Game', schema: GameSchema }]),
        KeycloakModule.registerAsync({
          useFactory: () => ({}),
        }),
        forwardRef(() => ChallengeModule),
        LeaderboardModule,
        HookModule,
        RewardModule,
        forwardRef(() => SubmissionModule),
      ],
      providers: [
        {
          provide: KeycloakService,
          useClass: KeycloakMockService,
        },
        GameRepository,
        GameService,
      ],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    service = module.get<GameService>(GameService);
    challengeService = module.get<ChallengeService>(ChallengeService);
    rewardService = module.get<RewardService>(RewardService);
    leaderboardService = module.get<LeaderboardService>(LeaderboardService);
    hookService = module.get<HookService>(HookService);
  });

  beforeEach(async () => {
    await cleanupMongo('Game');
    await cleanupMongo('Challenge');
    await cleanupMongo('Reward');
    await cleanupMongo('Leaderboard');
    await cleanupMongo('ActionHook');
    await cleanupMongo('ScheduledHook');
  });

  afterAll(async () => {
    // await closeMongoConnection();
    await connection.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('importGEdIL', () => {
    it('should import sample GEdIL package', async () => {
      const buff = fs.readFileSync(GEDIL_FILE);
      const data = {
        name: 'Some name',
        description: 'Some description.',
        startDate: new Date(Date.parse('2020-07-01')),
        endDate: new Date(Date.parse('2020-07-30')),
      };

      const game = await service.importGEdILArchive(
        {
          courseId: 'proto_fgpe',
          name: 'Some name',
          description: 'Some description.',
          startDate: new Date(Date.parse('2020-07-01')),
          endDate: new Date(Date.parse('2020-07-30')),
        },
        {
          content: Readable.from(buff),
        },
        '',
      );

      expect(game).toHaveProperty('name', data.name);
      expect(game).toHaveProperty('description', data.description);
      expect(game).toHaveProperty('startDate', data.startDate);
      expect(game).toHaveProperty('endDate', data.endDate);

      // check GEdIL imported
      await checkImportedGameTheARunGEdIL(game);
    });
  });

  async function checkImportedGameTheARunGEdIL(game: Game) {
    expect(game).toHaveProperty('gedilLayerId', '763836a4-be61-45ac-aeb1-7fa505b971fa');
    expect(game).toHaveProperty(
      'gedilLayerDescription',
      '[The A Run] Challenge set involving A-prefixed exercises (for demonstration purposes).',
    );

    const challenges = await challengeService.findByGameId(game.id);
    expect(challenges).toHaveLength(2);
    expect(challenges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: game.id,
          name: '3 Breaths a Beginner',
          description: 'Solve the first 3 exercises (A to C).',
          difficulty: 'AVERAGE',
          mode: 'NORMAL',
          modeParameters: [],
          locked: false,
          hidden: false,
          refs: ['A', 'B', 'C'],
        }),
        expect.objectContaining({
          game: game.id,
          name: 'Ultimate Test',
          description: 'Solve D within one hour (3 600 000 ms).',
          difficulty: 'MASTER',
          mode: 'TIME_BOMB',
          modeParameters: ['3600000'],
          locked: true,
          hidden: false,
          refs: ['D'],
        }),
      ]),
    );

    const rewards = await rewardService.findByGameId(game.id);
    expect(rewards).toHaveLength(3);
    expect(rewards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges[challenges.findIndex(challenge => !challenge.refs.includes('D'))].id,
          name: 'Certified Professional',
          description: 'Badge awarded for completing 5 Breaths of a Beginner challenge.',
          kind: 'BADGE',
          cost: 0,
          recurrent: false,
        }),
        expect.objectContaining({
          game: game.id,
          name: 'Unlock Ultimate Test',
          description: 'Unlocks the Ultimate Test challenge.',
          kind: 'UNLOCK',
          cost: 5,
          recurrent: false,
          challenges: [toMongoId(challenges.find(challenge => challenge.name === 'Ultimate Test')?.id)],
        }),
        expect.objectContaining({
          game: game.id,
          name: 'Hardworker',
          description: 'Badge granted when student makes 20 or more submissions.',
          kind: 'BADGE',
          cost: 0,
          recurrent: false,
        }),
      ]),
    );

    const leaderboards = await leaderboardService.findByGameId(game.id);
    expect(leaderboards).toHaveLength(1);
    expect(leaderboards).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: game.id,
          name: 'Flash-aholic',
          groups: true,
          metrics: ['$.player.points', "$.latestSubmissions.[?(@.result=='ACCEPT')].metrics.programSize"],
          sortingOrders: ['DESC', 'ASC'],
        }),
      ]),
    );

    const hooks = await hookService.findByGameId(game.id);
    expect(hooks).toHaveLength(7);
    expect(hooks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          trigger: 'CHALLENGE_COMPLETED',
          sourceId: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          active: true,
          criteria: {
            conditions: [],
            junctors: [],
          },
          actions: [
            {
              type: 'GIVE',
              parameters: [rewards.find(reward => reward.name === 'Certified Professional')?.id],
            },
          ],
          recurrent: false,
        }),
        expect.objectContaining({
          game: game.id,
          trigger: 'CHALLENGE_COMPLETED',
          sourceId: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          active: true,
          criteria: {
            conditions: [],
            junctors: [],
          },
          actions: [
            {
              type: 'GIVE',
              parameters: [rewards.find(reward => reward.name === 'Unlock Ultimate Test')?.id],
            },
          ],
          recurrent: false,
        }),
        expect.objectContaining({
          game: game.id,
          trigger: 'SUBMISSION_RECEIVED',
          criteria: {
            conditions: [
              {
                comparingFunction: 'GREAT_OR_EQUAL',
                leftEntity: 'PLAYER',
                leftProperty: '$.submissions.length',
                order: 0,
                rightEntity: 'FIXED',
                rightProperty: '20',
              },
            ],
            junctors: [],
          },
          actions: [
            {
              type: 'GIVE',
              parameters: [rewards.find(reward => reward.name === 'Hardworker')?.id],
            },
          ],
          active: true,
          recurrent: true,
        }),
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          trigger: 'SUBMISSION_ACCEPTED',
          sourceId: 'A',
          active: true,
          criteria: {
            conditions: [
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: 'A, B, C',
                order: 0,
                rightEntity: 'PLAYER',
                rightProperty: "$.submissions[?(@.result=='ACCEPT')].exerciseId",
              },
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: '',
                order: 1,
                rightEntity: 'PLAYER',
                rightProperty: "$.learningPath[?(@.state=='COMPLETED')].challenge",
              },
            ],
            junctors: ['AND'],
          },
          actions: [
            {
              type: 'UPDATE',
              parameters: [
                'CHALLENGE',
                challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
                'STATE',
                'COMPLETED',
              ],
            },
          ],
          recurrent: true,
        }),
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          trigger: 'SUBMISSION_ACCEPTED',
          sourceId: 'B',
          active: true,
          criteria: {
            conditions: [
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: 'A, B, C',
                order: 0,
                rightEntity: 'PLAYER',
                rightProperty: "$.submissions[?(@.result=='ACCEPT')].exerciseId",
              },
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: '',
                order: 1,
                rightEntity: 'PLAYER',
                rightProperty: "$.learningPath[?(@.state=='COMPLETED')].challenge",
              },
            ],
            junctors: ['AND'],
          },
          actions: [
            {
              type: 'UPDATE',
              parameters: [
                'CHALLENGE',
                challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
                'STATE',
                'COMPLETED',
              ],
            },
          ],
          recurrent: true,
        }),
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
          trigger: 'SUBMISSION_ACCEPTED',
          sourceId: 'C',
          active: true,
          criteria: {
            conditions: [
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: 'A, B, C',
                order: 0,
                rightEntity: 'PLAYER',
                rightProperty: "$.submissions[?(@.result=='ACCEPT')].exerciseId",
              },
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: '',
                order: 1,
                rightEntity: 'PLAYER',
                rightProperty: "$.learningPath[?(@.state=='COMPLETED')].challenge",
              },
            ],
            junctors: ['AND'],
          },
          actions: [
            {
              type: 'UPDATE',
              parameters: [
                'CHALLENGE',
                challenges.find(challenge => challenge.name === '3 Breaths a Beginner')?.id,
                'STATE',
                'COMPLETED',
              ],
            },
          ],
          recurrent: true,
        }),
        expect.objectContaining({
          game: game.id,
          parentChallenge: challenges.find(challenge => challenge.name === 'Ultimate Test')?.id,
          trigger: 'SUBMISSION_ACCEPTED',
          sourceId: 'D',
          active: true,
          criteria: {
            conditions: [
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: 'D',
                order: 0,
                rightEntity: 'PLAYER',
                rightProperty: "$.submissions[?(@.result=='ACCEPT')].exerciseId",
              },
              {
                comparingFunction: 'IN',
                leftEntity: 'FIXED',
                leftProperty: '',
                order: 1,
                rightEntity: 'PLAYER',
                rightProperty: "$.learningPath[?(@.state=='COMPLETED')].challenge",
              },
            ],
            junctors: ['AND'],
          },
          actions: [
            {
              type: 'UPDATE',
              parameters: [
                'CHALLENGE',
                challenges.find(challenge => challenge.name === 'Ultimate Test')?.id,
                'STATE',
                'COMPLETED',
              ],
            },
          ],
          recurrent: true,
        }),
      ]),
    );
  }
});
