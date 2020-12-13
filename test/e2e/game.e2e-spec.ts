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
import { GAMES_WORKFLOW, USERS, USERS_BY_ROLE } from '../utils/test-data';
import { KeycloakService } from '../../src/keycloak/keycloak.service';
import mockKeycloakService from '../../test/__mocks__/keycloak.service';
import { UserDto } from '../../src/keycloak/dto/user.dto';

describe('GameResolver (e2e)', () => {
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

    jest.spyOn(AuthGuard.prototype, 'canActivate').mockImplementation(async (context: ExecutionContext) => {
      const req: KeycloakRequest = getReq(context);
      req.grant = {
        expires_in: '',
        token_type: '',
        isExpired(): boolean {
          return false;
        },
        toString(): string | undefined {
          return 'abc';
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        update(): void {},
        access_token: {
          hasRole(): boolean {
            return false;
          },
          hasApplicationRole(): boolean {
            return false;
          },
          hasRealmRole(roleName: string): boolean {
            return roleName.toUpperCase() === Role.AUTHOR.toUpperCase();
          },
          isExpired(): boolean {
            return false;
          },
        },
      };
      return true;
    });

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Import GEdIL Archive', async () => {
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

  afterAll(async () => {
    await app.close();
  });
});
