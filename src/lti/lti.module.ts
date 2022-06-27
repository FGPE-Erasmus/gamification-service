import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ChallengeModule } from '../challenge/challenge.module';
import { ChallengeStatusModule } from '../challenge-status/challenge-status.module';
import { EvaluationEngineModule } from '../evaluation-engine/evaluation-engine.module';
import { KeycloakModule } from '../keycloak/keycloak.module';
import { GameModule } from '../game/game.module';
import { PlayerModule } from '../player/player.module';
import { LtiMiddleware } from './lti.middleware';
import { LtiController } from './lti.controller';
import { LtiService } from './lti.service';
import { LtiResolver } from './lti.resolver';

@Module({
  providers: [LtiService, LtiResolver],
  controllers: [LtiController],
  exports: [LtiService],
  imports: [KeycloakModule, GameModule, PlayerModule, EvaluationEngineModule, ChallengeModule, ChallengeStatusModule],
})
export class LtiModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LtiMiddleware).forRoutes('lti');
  }
}
