import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to extract user info from request.
 */
export const GqlUserInfo = createParamDecorator(
  (key: string, context: ExecutionContext): Record<string, any> => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req && ctx.req.userInfo;
  },
);
