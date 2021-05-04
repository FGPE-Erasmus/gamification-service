import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request } from 'express';

/**
 * Decorator to access the request data of a request.
 */
export const GqlRequest = createParamDecorator(
  (data: unknown, context: ExecutionContext): Request => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req;
  },
);
