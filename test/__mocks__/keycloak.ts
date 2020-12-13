import KeycloakConnect from 'keycloak-connect';
import { Role } from '../../src/common/enums/role.enum';
import { LOGGED_IN_STUDENT } from '../utils/test-data';

export const mockKeycloak = jest.fn();

const mock = jest.fn().mockImplementation(() => {
  return {
    grantManager: jest.fn().mockReturnValue({
      async createGrant(data: string | KeycloakConnect.GrantProperties): Promise<KeycloakConnect.Grant> {
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
      },
      ensureFreshness(grant: KeycloakConnect.Grant): Promise<KeycloakConnect.Grant> {
        return Promise.resolve(undefined);
      },
      obtainDirectly(username: string, password: string): Promise<KeycloakConnect.Grant> {
        return Promise.resolve(undefined);
      },
      obtainFromClientCredentials(
        callback?: (err: Error, grant: KeycloakConnect.Grant) => void,
        scopeParam?: string,
      ): Promise<KeycloakConnect.Grant> {
        return Promise.resolve(undefined);
      },
      obtainFromCode(
        code: string,
        sessionid?: string,
        sessionHost?: string,
        callback?: (err: Error, grant: KeycloakConnect.Grant) => void,
      ): Promise<KeycloakConnect.Grant> {
        return Promise.resolve(undefined);
      },
      validateAccessToken<T extends KeycloakConnect.Token | string>(token: T): Promise<false | T> {
        return Promise.resolve(undefined);
      },
      validateGrant(grant: KeycloakConnect.Grant): Promise<KeycloakConnect.Grant> {
        return Promise.resolve(undefined);
      },
      validateToken(token: KeycloakConnect.Token, expectedType?: string): Promise<KeycloakConnect.Token> {
        return Promise.resolve(undefined);
      },
      async userInfo<T extends KeycloakConnect.Token | string, C>(token: T): Promise<C> {
        return (LOGGED_IN_STUDENT as unknown) as C;
      },
    }),
  };
});

export default mock;
