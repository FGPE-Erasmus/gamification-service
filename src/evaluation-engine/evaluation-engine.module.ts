import { forwardRef, HttpModule, HttpService, Logger, Module, OnModuleInit } from '@nestjs/common';
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
import { ActivityStatusResolver } from './activity-status.resolver';
import { NotificationModule } from '../notifications/notification.module';
import { BaseConsumer } from './engines/base/base.consumer';
import { BaseService } from './engines/base/base-engine.service';

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
    forwardRef(() => NotificationModule),
  ],
  providers: [
    EvaluationEngineListener,
    EvaluationEngineService,
    MooshakService,
    MooshakConsumer,
    BaseConsumer,
    BaseService,
    ActivityService,
    ActivityResolver,
    ActivityStatusResolver,
    ProgrammingLanguageResolver,
  ],
  exports: [EvaluationEngineService, ActivityService],
})
export class EvaluationEngineModule implements OnModuleInit {
  protected readonly logger: Logger = new Logger(EvaluationEngineModule.name);

  constructor(private httpService: HttpService) {}

  public onModuleInit() {
    this.logger.warn('Initializing evaluation engine module');
    this.httpService.axiosRef.interceptors.request.use(req => {
      return new Promise(resolve => setTimeout(() => resolve(req), 250));
    });
  }
}
