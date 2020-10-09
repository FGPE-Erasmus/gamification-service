import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { Player } from '../../player/models/player.model';

/**
 * Decorator to extract player from request.
 */
export const GqlPlayer = createParamDecorator(
  (key: string, context: ExecutionContext): Player => {
    const ctx = GqlExecutionContext.create(context).getContext();
    return key ? ctx.req && ctx.req.player && ctx.req.player[key] : ctx.req && ctx.req.player;
  },
);
