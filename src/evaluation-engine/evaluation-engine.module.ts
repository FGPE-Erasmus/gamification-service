import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import { appConfig } from '../app.config';
import { SubscriptionsModule } from '../common/subscriptions/subscriptions.module';
import { GameModule } from '../game/game.module';
import { HookModule } from '../hook/hook.module';
import { EventModule } from '../event/event.module';
import { SubmissionModule } from '../submission/submission.module';
import { MooshakService } from './engines/mooshak/mooshak.service';
import { EvaluationEngineService } from './evaluation-engine.service';
import { MooshakConsumer } from './engines/mooshak/mooshak.consumer';
import { EvaluationEngineListener } from './evaluation-engine.listener';
import { ChallengeModule } from '../challenge/challenge.module';
import { ProgrammingLanguageResolver } from './programming-language.resolver';
import { PlayerModule } from '../player/player.module';
import { ActivityResolver } from './activity.resolver';
import { ActivityService } from './activity.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: appConfig.http.timeout,
        maxRedirects: appConfig.http.maxRedirects,
        baseURL: `${appConfig.evaluationEngine.protocol}://${appConfig.evaluationEngine.host}:${appConfig.evaluationEngine.port}${appConfig.evaluationEngine.urlPrefix}`,
      }),
    }),
    BullModule.registerQueueAsync({
      name: appConfig.queue.evaluation.name,
      useFactory: () => ({
        redis: {
          host: appConfig.messageBroker.host,
          port: appConfig.messageBroker.port,
        },
        defaultJobOptions: { ...appConfig.queue.evaluation.jobOptions },
      }),
    }),
    forwardRef(() => EventModule),
    forwardRef(() => HookModule),
    forwardRef(() => GameModule),
    forwardRef(() => PlayerModule),
    forwardRef(() => SubscriptionsModule),
    forwardRef(() => ChallengeModule),
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    EvaluationEngineListener,
    EvaluationEngineService,
    MooshakService,
    MooshakConsumer,
    ActivityService,
    ActivityResolver,
    ProgrammingLanguageResolver,
  ],
  exports: [EvaluationEngineService],
})
export class EvaluationEngineModule {}
