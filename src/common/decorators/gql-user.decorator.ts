import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { UserEntity as User } from '../../users/entities/user.entity';

/**
 * Decorator to extract user from request.
 */
export const GqlUser = createParamDecorator(
  (_, context: ExecutionContext): User => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req && ctx.req.user;
  },
);
