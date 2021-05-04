import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to extract session from request.
 */
export const GqlSession = createParamDecorator(
  (key: string, context: ExecutionContext): Record<string, any> => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req && ctx.req.session;
  },
);
