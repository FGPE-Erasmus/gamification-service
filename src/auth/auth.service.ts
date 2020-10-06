import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { appConfig } from '../app.config';
import { UserDto } from '../users/dto/user.dto';
import { Role } from '../users/models/role.enum';
import { UsersService } from '../users/users.service';
import SignupArgs from './args/signup.args';
import LoginArgs from './args/login.args';
import LoginResultDto from './dto/login-result.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService)) protected readonly usersService: UsersService,
    protected readonly jwtService: JwtService,
  ) {}

  /**
   * Login a user by validating credentials sent.
   *
   * @param credentials sent for validation
   */
  async login(credentials: LoginArgs): Promise<LoginResultDto | undefined> {
    const user = await this.usersService.findOneByLogin(credentials.login);
    if (!user) {
      throw Error('Email or password incorrect');
    }

    if (!user.active) {
      throw Error('Email or password incorrect');
    }

    const valid = await bcrypt.compare(credentials.password, user.password);
    if (!valid) {
      throw Error('Email or password incorrect');
    }

    const jwt = this.createJwt(user);

    return {
      token: jwt,
      expiresIn: appConfig.jwt.expirationTime,
      user,
    };
  }

  /**
   * Register a new user who filled-in the signup form.
   *
   * @param input
   */
  async signup(input: SignupArgs): Promise<LoginResultDto | undefined> {
    // find a user by email
    let user: UserDto = await this.usersService.findOneByEmail(input.email);
    if (user) {
      throw Error('Email already in use');
    }

    // find a user by username
    user = await this.usersService.findOneByUsername(input.username);
    if (user) {
      throw Error('Username already in use');
    }

    // hash the password
    user = await this.usersService.upsert(undefined, {
      ...input,
      roles: [Role.USER],
    });

    const jwt = this.jwtService.sign({ id: user.id });

    return { token: jwt, expiresIn: appConfig.jwt.expirationTime, user };
  }

  /**
   * Verifies that the JWT payload associated with a JWT is valid
   * by making sure the user exists and is enabled
   *
   * @param {id: string} payload
   * @returns {(Promise<User | undefined>)} returns undefined if there is no
   * user or the account is not enabled
   * @memberOf AuthService
   */
  async validateJwtPayload({ id }: { id: string }): Promise<UserDto | undefined> {
    // user has already logged in and has a JWT (let's check)
    const user = await this.usersService.findById(id);

    // the user exists and their account isn't disabled
    if (user && user.active) {
      user.updatedAt = new Date();
      return this.usersService.patch(user.id, user);
    }

    return undefined;
  }

  /**
   * Creates a JWT payload for the given user
   *
   * @param {User} user for whom to create the token
   * @returns {string} the generated JWT
   * @memberof AuthService
   */
  createJwt(user: UserDto): string {
    return this.jwtService.sign({
      id: user.id,
    });
  }
}
