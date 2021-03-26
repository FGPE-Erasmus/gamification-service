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
import {
  GAMES_WORKFLOW,
  LOGGED_IN_STUDENT,
  LOGGED_IN_STUDENT_ALT,
  LOGGED_IN_TEACHER,
  USERS,
  USERS_BY_ROLE,
} from '../utils/test-data';
import { KeycloakService } from '../../src/keycloak/keycloak.service';
import { UserDto } from '../../src/keycloak/dto/user.dto';
import { EvaluationEngineService } from '../../src/evaluation-engine/evaluation-engine.service';
import { IFile } from '../../src/common/interfaces/file.interface';
import { Submission } from '../../src/submission/models/submission.model';
import { TriggerEventEnum as TriggerEvent } from '../../src/hook/enums/trigger-event.enum';
import { SubmissionService } from '../../src/submission/submission.service';
import { Result } from '../../src/submission/models/result.enum';
import { EventService } from '../../src/event/event.service';
import { ChallengeStatusService } from '../../src/challenge-status/challenge-status.service';
import { ChallengeStatus } from '../../src/challenge-status/models/challenge-status.model';
import { testGrantForRole } from '../utils/test-grant';
import { PlayerRewardService } from '../../src/player-reward/player-reward.service';
import { PlayerReward } from '../../src/player-reward/models/player-reward.model';

describe('WorkflowSampleTest (e2e)', () => {
  let app: INestApplication;

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

  it('Import GEdIL Archive', async () => {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.TEACHER);
      req.userInfo = LOGGED_IN_TEACHER;
      return true;
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .field(
        'operations',
        JSON.stringify({
          query:
            'mutation ($file: Upload!) {\n importGEdILArchive(gameInput: { name: "Some name", description: "Some description.", startDate: "2020-12-01", endDate: "2020-12-30" }, file: $file) { id, name, description, gedilLayerId, gedilLayerDescription, startDate, endDate }\n}',
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
      .attach('0', path.resolve(__dirname, '../resources/gedil/sample.zip'));

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      importGEdILArchive: {
        description: 'Some description.',
        endDate: '2020-12-30T00:00:00.000Z',
        gedilLayerDescription: '[The A Run] Challenge set involving A-prefixed exercises (for demonstration purposes).',
        gedilLayerId: '763836a4-be61-45ac-aeb1-7fa505b971fa',
        id: expect.stringMatching('^[0-9a-fA-F]{24}'),
        name: 'Some name',
        startDate: '2020-12-01T00:00:00.000Z',
      },
    });
  });

  it('Assign Instructor', async () => {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.TEACHER);
      req.userInfo = LOGGED_IN_TEACHER;
      return true;
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:
          'mutation ($gameId: String!, $userId: String!) {\n  assignInstructor(\n    gameId: $gameId\n    userId: $userId\n  ) {\n    id\n    name\n    startDate\n    endDate\n    instructors {\n      username\n    }\n  }\n}\n',
        variables: {
          gameId: GAMES_WORKFLOW[0],
          userId: USERS_BY_ROLE[Role.TEACHER][0].id,
        },
      });

    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      assignInstructor: {
        id: '5fd4b3b2c5dc26001e0fe36c',
        name: 'Some name',
        startDate: '2020-12-01T00:00:00.000Z',
        endDate: '2020-12-30T00:00:00.000Z',
        instructors: [
          {
            username: 'teacher_fgpe',
          },
        ],
      },
    });
  });

  it('Add Two Groups', async () => {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.TEACHER);
      req.userInfo = LOGGED_IN_TEACHER;
      return true;
    });

    const groupsToAdd = [
      { name: 'G1', displayName: 'G1' },
      { name: 'G2', displayName: 'G2' },
    ];

    const addingGroups: Promise<void>[] = groupsToAdd.map(async group => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query:
            'mutation ($gameId: String!, $groupName: String!, $groupDisplayName: String!) {\n  saveGroup(gameId: $gameId, groupInput: {name: $groupName, displayName: $groupDisplayName}) {\n    id\n    name\n    displayName\n  }\n}\n',
          variables: {
            gameId: GAMES_WORKFLOW[1],
            groupName: group.name,
            groupDisplayName: group.displayName,
          },
        });
      expect(response.status).toEqual(200);
      expect(response.body.data).toEqual({
        saveGroup: {
          id: expect.stringMatching('^[0-9a-fA-F]{24}'),
          name: group.name,
          displayName: group.displayName,
        },
      });
    });

    expect(addingGroups).toHaveLength(2);
    await Promise.all(addingGroups);
  });

  it('Add Four Players', async () => {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.TEACHER);
      req.userInfo = LOGGED_IN_TEACHER;
      return true;
    });

    const addingPlayers: Promise<void>[] = USERS_BY_ROLE[Role.STUDENT].map(async student => {
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query:
            'mutation ($gameId: String!, $userId: String!) {\n  addToGame(\n    gameId: $gameId\n    userId: $userId\n  ) {\n    id\n    game {\n      id\n    }\n    user {\n      username\n    }\n  }\n}',
          variables: {
            gameId: GAMES_WORKFLOW[2],
            userId: student.id,
          },
        });
      expect(response.status).toEqual(200);
      expect(response.body.data).toEqual({
        addToGame: {
          id: expect.stringMatching('^[0-9a-fA-F]{24}'),
          game: {
            id: GAMES_WORKFLOW[2],
          },
          user: {
            username: student.username,
          },
        },
      });
    });

    expect(addingPlayers).toHaveLength(4);
    await Promise.all(addingPlayers);
  });

  it('Auto Assign Groups', async () => {
    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.TEACHER);
      req.userInfo = LOGGED_IN_TEACHER;
      return true;
    });

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query:
          'mutation ($gameId: String!) {\n  autoAssignGroups(\n    gameId: $gameId\n  ) {\n    id\n    game {\n      id\n    }\n    name\n    displayName\n    players {\n      user {\n        username\n      }\n    }\n  }\n}',
        variables: {
          gameId: GAMES_WORKFLOW[3],
        },
      });
    expect(response.status).toEqual(200);
    expect(response.body.data).toEqual({
      autoAssignGroups: expect.arrayContaining([
        {
          id: expect.stringMatching('^[0-9a-fA-F]{24}'),
          game: {
            id: GAMES_WORKFLOW[3],
          },
          name: 'G1',
          displayName: 'G1',
          players: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                username: expect.stringMatching(
                  new RegExp(USERS_BY_ROLE[Role.STUDENT].map(user => user.username).join('|')),
                ),
              }),
            }),
            expect.objectContaining({
              user: expect.objectContaining({
                username: expect.stringMatching(
                  new RegExp(USERS_BY_ROLE[Role.STUDENT].map(user => user.username).join('|')),
                ),
              }),
            }),
          ]),
        },
        {
          id: expect.stringMatching('^[0-9a-fA-F]{24}'),
          game: {
            id: GAMES_WORKFLOW[3],
          },
          name: 'G2',
          displayName: 'G2',
          players: expect.arrayContaining([
            expect.objectContaining({
              user: expect.objectContaining({
                username: expect.stringMatching(
                  new RegExp(USERS_BY_ROLE[Role.STUDENT].map(user => user.username).join('|')),
                ),
              }),
            }),
            expect.objectContaining({
              user: expect.objectContaining({
                username: expect.stringMatching(
                  new RegExp(USERS_BY_ROLE[Role.STUDENT].map(user => user.username).join('|')),
                ),
              }),
            }),
          ]),
        },
      ]),
    });
    expect(
      [].concat(...response.body.data.autoAssignGroups.map(group => group.players)).map(player => player.user.username),
    ).toEqual(expect.arrayContaining(USERS_BY_ROLE[Role.STUDENT].map(user => user.username)));
  });

  it('Challenge Unlocked', async cb => {
    const submissionService = app.get<SubmissionService>(SubmissionService);
    const eventService = app.get<EventService>(EventService);

    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.STUDENT);
      req.userInfo = LOGGED_IN_STUDENT;
      return true;
    });

    jest.spyOn(KeycloakService.prototype, 'userInfo', 'get').mockReturnValue(LOGGED_IN_STUDENT);

    jest.spyOn(EvaluationEngineService.prototype, 'evaluate').mockImplementation(
      async (submissionId: string): Promise<void> => {
        const submission: Submission = await submissionService.patch(submissionId, {
          language: 'python',
          grade: 100,
          result: Result.ACCEPT,
          metrics: new Map<string, number>(),
          feedback: 'blah blah',
          evaluatedAt: new Date(),
        });

        await eventService.fireEvent(TriggerEvent.SUBMISSION_EVALUATED, {
          gameId: submission.game,
          submissionId,
          exerciseId: submission.exerciseId,
          playerId: submission.player as string,
        });
      },
    );

    jest
      .spyOn(ChallengeStatusService.prototype, 'markAsAvailable')
      .mockImplementation(async (): Promise<ChallengeStatus> => cb());

    const gameId = GAMES_WORKFLOW[4];

    await submitAttempt(gameId, 'A', path.resolve(__dirname, '../resources/solutions/A/hello.py'));
    await submitAttempt(gameId, 'B', path.resolve(__dirname, '../resources/solutions/B/sum.py'));
    await submitAttempt(gameId, 'C', path.resolve(__dirname, '../resources/solutions/C/mean.py'));
  });

  it('Badge Granted (5 WAs)', async cb => {
    const submissionService = app.get<SubmissionService>(SubmissionService);
    const eventService = app.get<EventService>(EventService);

    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.STUDENT);
      req.userInfo = LOGGED_IN_STUDENT_ALT;
      return true;
    });

    jest.spyOn(KeycloakService.prototype, 'userInfo', 'get').mockReturnValue(LOGGED_IN_STUDENT_ALT);

    jest.spyOn(EvaluationEngineService.prototype, 'evaluate').mockImplementation(
      async (submissionId: string): Promise<void> => {
        const submission: Submission = await submissionService.patch(submissionId, {
          language: 'python',
          grade: 0,
          result: Result.WRONG_ANSWER,
          metrics: new Map<string, number>(),
          feedback: 'blah blah',
          evaluatedAt: new Date(),
        });

        await eventService.fireEvent(TriggerEvent.SUBMISSION_EVALUATED, {
          gameId: submission.game,
          submissionId,
          exerciseId: submission.exerciseId,
          playerId: submission.player as string,
        });
      },
    );

    jest.spyOn(PlayerRewardService.prototype, 'create').mockImplementation(async (): Promise<PlayerReward> => cb());

    const gameId = GAMES_WORKFLOW[4];

    await submitAttempt(gameId, 'A', path.resolve(__dirname, '../resources/solutions/A/hello.py'));
    await submitAttempt(gameId, 'B', path.resolve(__dirname, '../resources/solutions/B/sum.py'));
    await submitAttempt(gameId, 'C', path.resolve(__dirname, '../resources/solutions/C/mean.py'));
    await submitAttempt(gameId, 'A', path.resolve(__dirname, '../resources/solutions/A/hello.py'));
    await submitAttempt(gameId, 'A', path.resolve(__dirname, '../resources/solutions/A/hello.py'));
  });

  it('Badge Granted (Last Challenge)', async cb => {
    const submissionService = app.get<SubmissionService>(SubmissionService);
    const eventService = app.get<EventService>(EventService);

    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = testGrantForRole(Role.STUDENT);
      req.userInfo = LOGGED_IN_STUDENT;
      return true;
    });

    jest.spyOn(KeycloakService.prototype, 'userInfo', 'get').mockReturnValue(LOGGED_IN_STUDENT);

    jest.spyOn(EvaluationEngineService.prototype, 'evaluate').mockImplementation(
      async (submissionId: string): Promise<void> => {
        const submission: Submission = await submissionService.patch(submissionId, {
          language: 'python',
          grade: 0,
          result: Result.ACCEPT,
          metrics: new Map<string, number>(),
          feedback: 'blah blah',
          evaluatedAt: new Date(),
        });

        await eventService.fireEvent(TriggerEvent.SUBMISSION_EVALUATED, {
          gameId: submission.game,
          submissionId,
          exerciseId: submission.exerciseId,
          playerId: submission.player as string,
        });
      },
    );

    jest.spyOn(PlayerRewardService.prototype, 'create').mockImplementation(
      async (): Promise<PlayerReward> => {
        return cb();
      },
    );

    const gameId = GAMES_WORKFLOW[5];

    await submitAttempt(gameId, 'D', path.resolve(__dirname, '../resources/solutions/D/prime.py'));
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
    expect(response.body.data).toEqual({
      evaluate: expect.objectContaining({
        id: expect.stringMatching('^[0-9a-fA-F]{24}'),
      }),
    });

    return response.body.data.id;
  }

  afterAll(async () => {
    await app.close();
  });
});
