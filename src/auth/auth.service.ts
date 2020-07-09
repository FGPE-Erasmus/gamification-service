import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { appConfig } from '../app.config';
import { UserEntity as User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { Role } from '../users/entities/role.enum';
import SignupDto from './dto/signup.dto';
import LoginDto from './dto/login.dto';
import LoginResultDto from './dto/login-result.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Login a user by validating credentials sent.
   *
   * @param credentials sent for validation
   */
  async login(credentials: LoginDto): Promise<LoginResultDto | undefined> {
    let user = await this.usersService.findOneByEmail(credentials.login);
    if (!user) {
      user = await this.usersService.findOneByUsername(credentials.login);
      if (!user) {
        throw Error('Email or password incorrect');
      }
    }

    if (!user.active) {
      throw Error('Email or password incorrect');
    }

    const valid = await bcrypt.compare(credentials.password, user.password);
    if (!valid) {
      throw Error('Email or password incorrect');
    }

    const jwt = this.createJwt(user);

    return { token: jwt, expiresIn: appConfig.jwt.expirationTime, user };
  }

  /**
   * Register a new user who filled-in the signup form.
   *
   * @param credentials sent for validation
   */
  async signup(signupDto: SignupDto): Promise<LoginResultDto | undefined> {
    // find a user by email
    let user = await this.usersService.findOneByEmail(signupDto.email);
    if (user) {
      throw Error('Email already in use');
    }

    // find a user by username
    user = await this.usersService.findOneByUsername(signupDto.username);
    if (user) {
      throw Error('Username already in use');
    }

    // hash the password
    user = await this.usersService.upsertUser(undefined, {
      ...signupDto,
      roles: [Role.USER],
    });

    const jwt = this.jwtService.sign({ id: user.id });

    return { token: jwt, expiresIn: appConfig.jwt.expirationTime, user };
  }

  /**
   * Verifies that the JWT payload associated with a JWT is valid
   * by making sure the user exists and is enabled
   *
   * @param {JwtPayload} payload
   * @returns {(Promise<User | undefined>)} returns undefined if there is no
   * user or the account is not enabled
   * @memberof AuthService
   */
  async validateJwtPayload({ id }: { id: string }): Promise<User | undefined> {
    // user has already logged in and has a JWT (let's check)
    const user = await this.usersService.findUserById(id);

    // the user exists and their account isn't disabled
    if (user && user.active) {
      user.updatedAt = new Date();
      return this.usersService.updateUser(user);
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
  createJwt(user: User): string {
    const jwt = this.jwtService.sign({
      id: user.id.toHexString(),
    });

    return jwt;
  }
}
