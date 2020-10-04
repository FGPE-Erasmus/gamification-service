import { ObjectID } from 'mongodb';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';

import { appConfig } from '../app.config';
import { UsersService } from '../users/users.service';
import { UserRepository } from '../users/repositories/user.repository';
import { Role } from '../users/models/role.enum';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import SignupArgs from './args/signup.args';
import LoginResultDto from './dto/login-result.dto';
import { UserDto } from '../users/dto/user.dto';

describe('AuthService', () => {
  let service: AuthService;

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
      providers: [AuthService, AuthResolver, JwtStrategy, UsersService, UserRepository],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should signup a new User', async () => {
    const mockSignupDto: SignupArgs = {
      name: 'John Doe',
      username: 'johndoe',
      email: 'johndoe@johndoe.com',
      password: 'j0hnD03',
    };

    const newUser: UserDto = {
      id: new ObjectID().toHexString(),
      createdAt: new Date(),
      active: true,
      roles: [Role.USER],
      ...mockSignupDto,
      password: await bcrypt.hash(mockSignupDto.password, 10),
    };

    const result: LoginResultDto = {
      token: '---',
      expiresIn: appConfig.jwt.expirationTime,
      user: newUser,
    };

    jest.spyOn(service, 'signup').mockImplementation(() => Promise.resolve(result));

    expect(await (await service.signup(mockSignupDto)).user).toBe(newUser);
  });
});
