import { CustomDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const GAME_KEY_EXTRACTOR = 'gameKeyExtractor';

/**
 * Decorator with function to extract game from request.
 */
export const GameKeyExtractor = (fn: (context: ExecutionContext) => string): CustomDecorator =>
  SetMetadata(GAME_KEY_EXTRACTOR, fn);
