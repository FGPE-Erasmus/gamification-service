import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { AppModule } from '../../src/app.module';

describe('UsersResolver (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      /*.overrideGuard(GqlJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(GqlAdminGuard)
      .useValue({ canActivate: () => true })*/
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('Query Users', () => {
    const query = {
      query: `{
        users {
          items {
            id
            name
            username
            email
          }
          total
        }
      }`,
    };

    request(app.getHttpServer())
      .post('/graphql')
      .send(query)
      .expect(200, {
        users: {
          items: [],
          total: 0,
        },
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
