import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import DbTestModule, { cleanupMongo, closeMongoConnection } from '../../../test/utils/db-test.module';
import { UserRepository } from './user.repository';
import { UserSchema } from '../models/user.model';
import { Connection } from 'mongoose';

describe('UserRepository', () => {
  let connection: Connection;
  let repo: UserRepository;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbTestModule({}), MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
      providers: [UserRepository],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    repo = module.get<UserRepository>(UserRepository);
  });

  beforeEach(async () => {
    await cleanupMongo('User');
  });

  afterAll(async () => {
    // await closeMongoConnection();
    await connection.close();
  });

  it('should be defined', () => {
    expect(repo).toBeDefined();
  });
});
