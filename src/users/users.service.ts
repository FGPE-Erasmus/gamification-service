import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { ServiceHelper } from '../common/helpers/service.helper';
import { generatePassword } from '../common/utils/password-generator.util';
import { UserEntity as User } from './entities/user.entity';
import { FindUsersDto } from './dto/find-users.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersEntity } from './entities/list-users.entity';
import { UserRepository } from './repositories/user.repository';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly serviceHelper: ServiceHelper, private readonly userRepository: UserRepository) {}

  /**
   * Returns a user by their ID
   *
   * @param {string} id of user
   * @returns {(Promise<User | undefined>)}
   * @memberof UsersService
   */
  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        _id: ObjectId(id),
      },
    });
  }

  /**
   * Returns a user by their unique email address or undefined
   *
   * @param {string} email address of user, not case sensitive
   * @returns {(Promise<User | undefined>)}
   * @memberof UsersService
   */
  async findOneByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email: email.toLowerCase() });
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
   * @memberof UsersService
   */
  async findOneByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({ username: username.toLowerCase() });
    if (user) {
      return user;
    }
    return undefined;
  }

  /**
   * Find users matching given criteria
   *
   * @param {FindUsersDto} params to search for
   * @returns {Promise<ListUsersEntity>}
   * @memberof UsersService
   */
  async findUsers(params: FindUsersDto): Promise<ListUsersEntity> {
    return await this.serviceHelper.findAllByNameOrIds(params, this.userRepository);
  }

  /**
   * Create/update user with a set of providesd fields.
   *
   * @param id of the user to update (if any)
   * @param data to update
   */
  async upsertUser(id: string | undefined, data: CreateUserDto): Promise<User> {
    const { email, username } = data;

    let userExists: User;
    if (email) {
      // check if there are other users with this email
      userExists = await this.userRepository.findOne({
        where: {
          email,
        },
      });
      if (userExists && id !== userExists.id.toHexString()) {
        throw new Error(`E-mail ${email} is already in use.`);
      }
    } else if (!id) {
      throw new Error(`Email is a mandatory field.`);
    }

    if (username) {
      // check if there are other users with this username
      userExists = await this.userRepository.findOne({
        where: {
          username,
        },
      });
      if (userExists && id !== userExists.id.toHexString()) {
        throw new Error(`Username ${username} is already in use.`);
      }
    } else if (!id) {
      throw new Error(`Username is a mandatory field.`);
    }

    // set active on create
    const fields: { [k: string]: any } = { ...data };
    if (!id) {
      fields.active = true;
    }

    // merge data with repository
    const newUser: User = await this.serviceHelper.getUpsertData(id, fields, this.userRepository);

    // encrypt password if sent
    if (data.password) {
      newUser.password = await bcrypt.hash(data.password, 10);
    } else if (!id) {
      newUser.password = await bcrypt.hash(generatePassword(20), 10);
    }

    // save user
    return this.userRepository.save(newUser);
  }

  /**
   * Update a user.
   *
   * @param user with updated properties
   * @returns {User} updated user
   * @memberof UsersService
   */
  async updateUser(user: Partial<User>): Promise<User> {
    return this.userRepository.save(user);
  }

  /**
   * Delete the user with given ID
   *
   * @param {string} user to delete
   * @returns {boolean}
   * @memberof UsersService
   */
  async deleteUser(id: string): Promise<boolean> {
    const user: User = await this.userRepository.findOne(id);
    return Boolean(this.updateUser({ ...user, active: false }));
  }

  /**
   * Returns if the user has admin set on the roles array
   *
   * @param {User} user to check for admin role
   * @returns {boolean}
   * @memberof UsersService
   */
  isAdmin(user: User): boolean {
    return user.roles.includes(Role.ADMIN);
  }
}
