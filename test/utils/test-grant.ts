import { Role } from '../../src/common/enums/role.enum';
import { Grant } from 'keycloak-connect';

export const testGrantForRole = (...roles: Role[]): Grant => ({
  expires_in: '',
  token_type: '',
  isExpired(): boolean {
    return false;
  },
  toString(): string | undefined {
    return 'abc';
  },
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(): void {},
  access_token: {
    hasRole(): boolean {
      return false;
    },
    hasApplicationRole(): boolean {
      return false;
    },
    hasRealmRole(roleName: string): boolean {
      return roles.includes(Role[roleName.toUpperCase()]);
    },
    isExpired(): boolean {
      return false;
    },
  },
});
