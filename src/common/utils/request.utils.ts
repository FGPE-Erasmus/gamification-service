import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { GAME_KEY_EXTRACTOR } from '../decorators/game-key-extractor.decorator';
import { GqlExecutionContext } from '@nestjs/graphql';

let nestjsGraphql: any;
try {
  nestjsGraphql = require('@nestjs/graphql');
} catch (err) {}

export function getReq(context: ExecutionContext): Request {
  if ((context.getType() as string) === 'graphql' && nestjsGraphql) {
    const ctx = nestjsGraphql.GqlExecutionContext.create(context).getContext();
    if (ctx.req) return ctx.req;
  }
  return context.switchToHttp().getRequest();
}

export function isGraphQL(context: ExecutionContext): boolean {
  return (context.getType() as string) === 'graphql' && nestjsGraphql;
}

export function getGameId(
  context: ExecutionContext,
  extractorFn = (context: ExecutionContext) => (context as GqlExecutionContext).getArgs()['gameId'],
): string {
  return extractorFn(isGraphQL(context) ? GqlExecutionContext.create(context) : context);
}
