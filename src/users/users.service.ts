import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { BaseService } from '../common/services/base.service';
import { generatePassword } from '../common/utils/password-generator.util';
import { User } from './models/user.model';
import { UserInput } from './inputs/user.input';
import { Role } from './models/role.enum';
import { UserDto } from './dto/user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UsersService extends BaseService<User> implements OnModuleInit {
  constructor(protected readonly repository: UserRepository) {
    super(new Logger(UsersService.name), repository);
  }

  async onModuleInit(): Promise<void> {
    const admin: UserDto = await this.findOneByUsername('admin');
    if (!admin) {
      const saved = await this.repository.save({
        name: 'Administrator',
        username: 'admin',
        email: 'admin@fgpe-gs.com',
        password: await bcrypt.hash('4dm1nS.', 10),
        roles: [Role.ADMIN],
        active: true,
      });
      this.logger.error(saved);
    }
  }

  /**
   * Returns a user by their unique username/email address or undefined
   *
   * @param {string} login address of user, not case sensitive, or username
   * @returns {(Promise<UserDto | undefined>)}
   * @memberOf UsersService
   */
  async findOneByLogin(login: string): Promise<User> {
    let user = await this.findOneByEmail(login);
    if (!user) {
      user = await this.findOneByUsername(login);
      if (!user) {
        return undefined;
      }
      return user;
    }
    return user;
  }

  /**
   * Returns a user by their unique email address or undefined
   *
   * @param {string} email address of user, not case sensitive
   * @returns {(Promise<User | undefined>)}
   * @memberOf UsersService
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.findOne({ email: email.toLowerCase() });
    if (user) {
      return user;
    }
    return undefined;
  }

  /**
   * Returns a user by their unique username or undefined
   *
   * @param {string} username of user, not case sensitive
   * @returns {(Promise<User | undefined>)}
   * @memberOf UsersService
   */
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.findOne({ username: username.toLowerCase() });
    if (user) {
      return user;
    }
    return undefined;
  }

  /**
   * Create/update user with a set of providesd fields.
   *
   * @param id of the user to update (if any)
   * @param data to update
   */
  async upsert(id: string | undefined, data: UserInput): Promise<User> {
    const { email, username } = data;

    let userExists: User;
    if (email) {
      // check if there are other users with this email
      userExists = await this.repository.findOne({
        email,
      });
      if (userExists && id !== userExists._id.toHexString()) {
        throw new Error(`E-mail ${email} is already in use.`);
      }
    } else if (!id) {
      throw new Error(`Email is a mandatory field.`);
    }

    if (username) {
      // check if there are other users with this username
      userExists = await this.repository.findOne({
        username,
      });
      if (userExists && id !== userExists._id.toHexString()) {
        throw new Error(`Username ${username} is already in use.`);
      }
    } else if (!id) {
      throw new Error(`Username is a mandatory field.`);
    }

    let newUser: User;
    if (!id) {
      // create user
      newUser = await this.create({ ...data, active: true });
    } else {
      // update user
      newUser = await this.patch(id, data);
    }

    // encrypt password if sent
    let password: string;
    if (data.password) {
      password = await bcrypt.hash(data.password, 10);
    } else if (!id) {
      password = await bcrypt.hash(generatePassword(20), 10);
    }

    if (password) {
      newUser = await this.patch(newUser.id, { password });
    }

    // save user
    return newUser;
  }

  async delete(id: string): Promise<User> {
    return super.delete(id, true);
  }

  /**
   * Returns if the user has admin set on the roles array
   *
   * @param {User} user to check for admin role
   * @returns {boolean}
   * @memberOf UsersService
   */
  isAdmin(user: User): boolean {
    return user.roles.includes(Role.ADMIN);
  }
}
