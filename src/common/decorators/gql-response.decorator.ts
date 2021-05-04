import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Response } from 'express';

/**
 * Decorator to access the response channel of a request.
 */
export const GqlResponse = createParamDecorator(
  (data: unknown, context: ExecutionContext): Response => GqlExecutionContext.create(context).getContext().res,
);
