import * as path from 'path';
import { APP_GUARD } from '@nestjs/core';
import { ExecutionContext, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { AuthGuard } from '../../src/keycloak/guards/auth.guard';
import { KeycloakRequest } from '../../src/keycloak/types/keycloak-request.type';
import { getReq } from '../../src/common/utils/request.utils';
import { Role } from '../../src/common/enums/role.enum';
import { LOGGED_IN_AUTHOR, LOGGED_IN_STUDENT, USERS } from '../utils/test-data';
import { KeycloakService } from '../../src/keycloak/keycloak.service';
import { UserDto } from '../../src/keycloak/dto/user.dto';
import { testGrantForRole } from '../utils/test-grant';
import { MooshakService } from '../../src/evaluation-engine/engines/mooshak/mooshak.service';
import { Result } from '../../src/submission/models/result.enum';
import { JSONPath } from 'jsonpath-plus';
import { EvaluationDto } from '../../src/evaluation-engine/dto/evaluation.dto';
import { EvaluationEngine } from '../../src/submission/models/evaluation-engine.enum';
import { Player } from 'src/player/models/player.model';

describe('Modes test (e2e)', () => {
  let app: INestApplication;
  let hackit_id: string;
  let shortening_id: string;
  let speedup_id: string;

  const submission = {
    id: '5feeab477c1caf00b400f476',
    game: '5feeab477c1caf00b400f475',
    player: '5feeab477c1caf00b400f474',
    exerciseId: 'A',
    metrics: {
      linesOfCode: 10,
      executionTime: 30,
    },
    result: Result.ACCEPT,
    evaluatedAt: new Date(),
  };

  const player: Player = {
    id: '5feeab477c1caf00b400f474',
    user: '5feeab477c1caf00b400f473',
    game: '5feeab477c1caf00b400f475',
    submissions: [submission],
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
      ],
    }).compile();

    jest.spyOn(KeycloakService.prototype, 'getUser').mockImplementation(
      async (userId: string): Promise<UserDto> => {
        const index = USERS.findIndex(user => userId === user.id);
        return index >= 0 ? USERS[index] : null;
      },
    );

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('HACK_IT', () => {
    it('Import GEdIL Archive', async () => {
      hackit_id = await importGEdIL('hackit');
    });

    it('Pass modeParameters to submission evaluation', async () => {
      jest.spyOn(KeycloakService.prototype, 'userInfo', 'get').mockReturnValue(LOGGED_IN_STUDENT);

      jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
        const req: KeycloakRequest = getReq(context);
        req.grant = testGrantForRole(Role.STUDENT);
        req.userInfo = LOGGED_IN_STUDENT;
        return true;
      });

      const mooshakServiceEval = jest.spyOn(MooshakService.prototype, 'evaluate').mockImplementation(async () => {
        const evalDto: EvaluationDto = {
          evaluationEngine: EvaluationEngine.MOOSHAK,
          evaluationEngineId: '1234567890',
          language: 'python',
          metrics: new Map<string, number>(),
          result: Result.ACCEPT,
          grade: 5,
          feedback: 'feedback',
          evaluatedAt: new Date(),
        };
        return evalDto;
      });

      await submitAttempt(hackit_id, 'A', path.resolve(__dirname, '../resources/solutions/A/hello.py'));
      expect(mooshakServiceEval).toBeCalledWith([3000, 'hello']);
    });
  });

  describe('SHORTENING + TIMEBOMB', () => {
    it('Import GEdIL Archive', async () => {
      shortening_id = await importGEdIL('shortening');
    });

    it('Create a shortening condition', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query:
            'query ($gameId: String!) {\n actionHooks(gameId: $gameId) {\n game\n { id\n }, criteria\n {\n conditions\n {\n rightEntity\n, rightProperty\n }\n }\n }\n }\n',
          variables: {
            gameId: shortening_id,
          },
        });

      expect(response.body.data.actionHooks[1].criteria.conditions.length).toEqual(3);
      expect(response.body.data.actionHooks[2].criteria.conditions.length).toEqual(3);
      expect(response.body.data.actionHooks[3].criteria.conditions.length).toEqual(3);
    });

    it('Create a timebomb scheduled hook', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query:
            'query ($gameId: String!) {\n scheduledHooks(gameId: $gameId) {\n game\n { id\n }, criteria\n {\n conditions\n {\n rightEntity\n, rightProperty\n }\n }\n }\n }\n',
          variables: {
            gameId: shortening_id,
          },
        });

      expect(response.body.data.scheduledHooks.length).toEqual(1);
    });

    it('Check the lines of code', async () => {
      const linesOfCodeCriteria = 15;

      const linesOfCodeInSub = JSONPath({
        path: `$.submissions[?(@.game==\'${submission.game}\' && @.result==\'${Result.ACCEPT}\')].metrics.linesOfCode`,
        json: player,
        wrap: false,
      });

      expect(linesOfCodeInSub[0]).toBeLessThanOrEqual(linesOfCodeCriteria);
    });
  });

  describe('SPEEDUP', () => {
    it('Import GEdIL Archive', async () => {
      speedup_id = await importGEdIL('speedup');
    });

    it('Create a speedup condition', async () => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query:
            'query ($gameId: String!) {\n actionHooks(gameId: $gameId) {\n game\n { id\n }, criteria\n {\n conditions\n {\n rightEntity\n, rightProperty\n }\n }\n }\n }\n',
          variables: {
            gameId: speedup_id,
          },
        });
      expect(response.body.data.actionHooks[1].criteria.conditions.length).toEqual(3);
      expect(response.body.data.actionHooks[2].criteria.conditions.length).toEqual(3);
      expect(response.body.data.actionHooks[3].criteria.conditions.length).toEqual(3);
    });

    it('Check the execution Time', async () => {
      const executionTimeCriteria = 800;

      const submissionExecutionTime = JSONPath({
        path: `$.submissions[?(@.result==\'${Result.ACCEPT}\')].metrics.executionTime`,
        json: player,
      });

      expect(submissionExecutionTime[0]).toBeLessThanOrEqual(executionTimeCriteria);
    });
  });

  async function submitAttempt(gameId: string, exerciseId: string, solution: string): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .field(
        'operations',
        JSON.stringify({
          query: `mutation ($file: Upload!) {\n evaluate(gameId: \"${gameId}\", exerciseId: \"${exerciseId}\", file: $file) { id }\n}`,
          variables: {
            file: null,
          },
        }),
      )
      .field(
        'map',
        JSON.stringify({
          '0': ['variables.file'],
        }),
      )
      .attach('0', solution);

    expect(response.status).toEqual(200);
    return response.body.data.id;
  }

  async function importGEdIL(mode: string): Promise<string> {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.AUTHOR);
      req.userInfo = LOGGED_IN_AUTHOR;
      return true;
    });

    const response = await request(app.getHttpServer())
      .post('/upload')
      .field('name', `Test-${mode}`)
      .field('description', 'Test description')
      .field('startDate', '2021-01-02')
      .field('endDate', '2022-01-02')
      .field('users[]', 'user1')
      .attach('file', path.resolve(__dirname, `../resources/gedil/modes/${mode}-timebomb.zip`));

    expect(response.status).toEqual(201);
    return response.body.id;
  }

  afterAll(async () => {
    await app.close();
  });
});
