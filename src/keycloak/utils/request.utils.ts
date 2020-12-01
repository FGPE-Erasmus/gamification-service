import { ExecutionContext, Request } from '@nestjs/common';

import { KeycloakRequest } from '../types/keycloak-request.type';
import { appConfig } from '../../app.config';

let nestjsGraphql: any;
try {
  nestjsGraphql = require('@nestjs/graphql');
} catch (err) {}

export function getReq(context: ExecutionContext): KeycloakRequest<Request> {
  if ((context.getType() as string) === 'graphql' && nestjsGraphql) {
    const ctx = nestjsGraphql.GqlExecutionContext.create(context).getContext();
    if (ctx.req) return ctx.req;
  }
  return context.switchToHttp().getRequest();
}

export function extractJwt(req: any): string | null {
  if (req && req.cookies && req.cookies[appConfig.auth.keycloak.cookieKey]) {
    return req.cookies[appConfig.auth.keycloak.cookieKey];
  }
  const { authorization } = req.headers;
  if (typeof authorization === 'undefined') return null;
  if (authorization?.indexOf(' ') <= -1) return authorization;
  const auth = authorization?.split(' ');
  if (auth && auth[0] && auth[0].toLowerCase() === 'bearer') return auth[1];
  return null;
}
