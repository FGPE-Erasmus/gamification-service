import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { KeycloakRequest } from '../../keycloak/types/keycloak-request.type';
import { Role } from '../enums/role.enum';
import { getReq } from '../utils/request.utils';

/**
 * Decorator to extract user info from request.
 */
export const GqlUserInfo = createParamDecorator((key: string, context: ExecutionContext):
  | Record<string, any>
  | Role => {
  const ctx = GqlExecutionContext.create(context).getContext();
  if (key == 'ROLE') {
    const keycloakReq: KeycloakRequest = getReq(context);
    if (keycloakReq.grant?.access_token?.hasRealmRole(Role.STUDENT)) {
      return Role.STUDENT;
    } else if (keycloakReq.grant?.access_token?.hasRealmRole(Role.TEACHER)) {
      return Role.TEACHER;
    } else {
      throw new Error("Unknown user's role");
    }
  }
  return key ? ctx.req && ctx.req.userInfo && ctx.req.userInfo[key] : ctx.req && ctx.req.userInfo;
});
