import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { appConfig } from '../app.config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import DbTestModule, { cleanupMongo, closeMongoConnection } from '../../test/utils/db-test.module';
import { UserSchema } from '../users/models/user.model';
import { Connection } from 'mongoose';

describe('AuthResolver', () => {
  let connection: Connection;
  let resolver: AuthResolver;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({
          defaultStrategy: 'jwt',
        }),
        JwtModule.register({
          secret: appConfig.jwt.secret,
          signOptions: {
            expiresIn: appConfig.jwt.expirationTime,
            issuer: appConfig.uuid,
          },
        }),
        DbTestModule({}),
        MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
      ],
      providers: [AuthService, AuthResolver, JwtStrategy, UsersService, UserRepository],
    }).compile();

    connection = module.get<Connection>(await getConnectionToken());
    resolver = module.get<AuthResolver>(AuthResolver);
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

  it('should login user', () => {
    expect(resolver).toBeDefined();
  });
});
