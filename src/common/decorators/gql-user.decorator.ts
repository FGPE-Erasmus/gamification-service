import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { User } from '../../users/models/user.model';

/**
 * Decorator to extract user from request.
 */
export const GqlUser = createParamDecorator(
  (key: string, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return key ? ctx.req && ctx.req.user && ctx.req.user[key] : ctx.req && ctx.req.user;
  },
);
