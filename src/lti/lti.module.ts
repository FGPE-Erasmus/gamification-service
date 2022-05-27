import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { LtiMiddleware } from './lti.middleware';
import { LtiController } from './lti.controller';
import { LtiService } from './lti.service';

@Module({
  providers: [LtiService],
  controllers: [LtiController],
  exports: [LtiService],
})
export class LtiModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LtiMiddleware).forRoutes('lti');
  }
}
