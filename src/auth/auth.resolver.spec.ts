import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';

import { appConfig } from '../app.config';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { ServiceHelper } from '../common/helpers/service.helper';
import { UserRepository } from '../users/repositories/user.repository';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './strategies/jwt.strategy';

describe('AuthResolver', () => {
  let resolver: AuthResolver;

  beforeEach(async () => {
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
      ],
      providers: [AuthService, AuthResolver, JwtStrategy, UsersService, ServiceHelper, UserRepository],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
