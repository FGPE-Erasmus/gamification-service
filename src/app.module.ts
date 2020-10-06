import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { GraphQLJSON } from 'graphql-type-json';

import { appConfig } from './app.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DateScalar } from './common/scalars/date.scalar';
import { EmailScalar } from './common/scalars/email.scalar';
import { HealthModule } from './healthcheck/healthcheck.module';
import { GameModule } from './game/game.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ChallengeStatusModule } from './challenge-status/challenge-status.module';
import { SubmissionModule } from './submission/submission.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PlayerModule } from './player/player.module';
import { ProcessorModule } from './consumers/processor.module';
import { HookModule } from './hook/hook.module';
import { RewardModule } from './reward/reward.module';
import { QueueConfigService } from './queue.config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `${appConfig.database.protocol}://${appConfig.database.username}:${appConfig.database.password}@${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.database}`,
        authSource: appConfig.database.authSource,
        useUnifiedTopology: appConfig.database.useUnifiedTopology,
        useNewUrlParser: appConfig.database.useNewUrlParser,
        loggerLevel: appConfig.database.loggerLevel,
        connectionFactory: connection => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-autopopulate'));
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-timestamp'));
          return connection;
        },
        useFindAndModify: false,
      }),
    }),
    GraphQLModule.forRoot({
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: appConfig.isDevelopment,
      playground: appConfig.isDevelopment,
      installSubscriptionHandlers: true,
      resolvers: { JSON: GraphQLJSON },
    }),
    BullModule.registerQueueAsync({
      name: 'hooksQueue',
      useClass: QueueConfigService,
    }),
    // ProcessorModule,
    HealthModule,
    AuthModule,
    UsersModule,
    GameModule,
    ChallengeModule,
    ChallengeStatusModule,
    LeaderboardModule,
    PlayerModule,
    SubmissionModule,
    RewardModule,
    HookModule,
  ],
  providers: [DateScalar, EmailScalar],
})
export class AppModule {}
