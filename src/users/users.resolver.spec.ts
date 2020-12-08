import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from './users.service';
import { UsersResolver } from './users.resolver';
import { UserRepository } from './repositories/user.repository';
import { UserToDtoMapper } from './mappers/user-to-dto.mapper';
import DbTestModule, { cleanupMongo } from '../../test/utils/db-test.module';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './models/user.model';
import { Connection } from 'mongoose';

describe('UsersResolver', () => {
  let connection: Connection;
  let resolver: UsersResolver;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DbTestModule({}), MongooseModule.forFeature([{ name: 'User', schema: UserSchema }])],
      providers: [UserToDtoMapper, UsersService, UserRepository, UsersResolver],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    resolver = module.get<UsersResolver>(UsersResolver);
  });

  beforeEach(async () => {
    await cleanupMongo('User');
  });

  afterAll(async () => {
    // await closeMongoConnection();
    await connection.close();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
