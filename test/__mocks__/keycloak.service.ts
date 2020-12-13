import { LoginArgs } from '../../src/keycloak/args/login.args';
import { AuthDto } from '../../src/keycloak/dto/auth.dto';
import { UserInfo } from '../../src/keycloak/interfaces/user-info.interface';
import { UserDto } from '../../src/keycloak/dto/user.dto';
import { Role } from '../../src/common/enums/role.enum';
import { LOGGED_IN_STUDENT, USERS, USERS_BY_ROLE } from '../utils/test-data';
import KeycloakConnect from 'keycloak-connect';

const mock = jest.fn().mockImplementation(() => {
  return {
    authenticate: jest.fn().mockImplementation(
      async (loginArgs: LoginArgs): Promise<AuthDto> => {
        return {
          scope: 'openid email profile',
          message: 'authenticated',
          accessToken: 'abc',
          refreshToken: 'cba',
          tokenType: 'bearer',
          expiresIn: 300,
          refreshExpiresIn: 1000,
        };
      },
    ),
    logout: jest.fn().mockImplementation(
      async (): Promise<null> => {
        return null;
      },
    ),
    userInfo: jest.fn().mockImplementation((): UserInfo | undefined => {
      return {
        sub: '1',
        emailVerified: true,
        preferredUsername: 'yoda',
        firstName: 'Yoda',
        lastName: 'Light',
      };
    }),
    grant: jest.fn().mockImplementation((): any | undefined => {
      return {
        expires_in: '',
        id_token: undefined,
        refresh_token: undefined,
        token_type: '',
        isExpired(): boolean {
          return false;
        },
        toString(): string | undefined {
          return 'abc';
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        update(grant: KeycloakConnect.Grant): void {},
        access_token: {
          hasRole(roleName: string): boolean {
            return false;
          },
          hasApplicationRole(appName: string, roleName: string): boolean {
            return false;
          },
          hasRealmRole(roleName: string): boolean {
            return roleName.toUpperCase() === Role.STUDENT.toUpperCase();
          },
          isExpired(): boolean {
            return false;
          },
        },
      };
    }),
    getUsers: jest.fn().mockImplementation(
      async (): Promise<UserDto[]> => {
        return USERS;
      },
    ),
    getUser: jest.fn().mockImplementation(
      async (userId: string): Promise<UserDto> => {
        const index = USERS.findIndex(user => userId === user.id);
        return index >= 0 ? USERS[index] : null;
      },
    ),
    getUsersByRole: jest.fn().mockImplementation(
      async (role: Role): Promise<UserDto[]> => {
        return USERS_BY_ROLE[role];
      },
    ),
  };
});

export default mock;
