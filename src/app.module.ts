import { join } from 'path';
import { Global, HttpModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLJSON } from 'graphql-type-json';

import { appConfig } from './app.config';
import { DateScalar } from './common/scalars/date.scalar';
import { HealthModule } from './healthcheck/healthcheck.module';
import { GameModule } from './game/game.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ChallengeStatusModule } from './challenge-status/challenge-status.module';
import { SubmissionModule } from './submission/submission.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PlayerModule } from './player/player.module';
import { HookModule } from './hook/hook.module';
import { RewardModule } from './reward/reward.module';
import { EventModule } from './event/event.module';
import { EvaluationEngineModule } from './evaluation-engine/evaluation-engine.module';
import { SubscriptionsModule } from './common/subscriptions/subscriptions.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { AuthGuard } from './keycloak/guards/auth.guard';
import { ResourceGuard } from './keycloak/guards/resource.guard';
import { ScheduleModule } from '@nestjs/schedule';

@Global()
@Module({
  imports: [
    HttpModule,
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: `${appConfig.database.protocol}://${appConfig.database.username}:${appConfig.database.password}@${appConfig.database.host}:${appConfig.database.port}/${appConfig.database.database}`,
        authSource: appConfig.database.authSource,
        useUnifiedTopology: appConfig.database.useUnifiedTopology,
        useNewUrlParser: appConfig.database.useNewUrlParser,
        useCreateIndex: appConfig.database.useCreateIndex,
        loggerLevel: appConfig.database.loggerLevel,
        connectionFactory: connection => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-autopopulate'));
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-timestamp'));
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-lean-virtuals'));
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          connection.plugin(require('mongoose-lean-id'));
          return connection;
        },
        useFindAndModify: false,
      }),
    }),
    GraphQLModule.forRoot({
      context: ({ req, res, payload, connection }) => ({
        req,
        res,
        payload,
        connection,
      }),
      subscriptions: {
        onConnect: (connectionParams: { [key: string]: any }, websocket: { [key: string]: any }) => {
          return {
            headers: {
              ...websocket?.upgradeReq?.headers,
              authorization: connectionParams.authorization,
            },
          };
        },
      },
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      cors: {
        origin: '*',
        methods: 'GET, HEAD, OPTIONS, PUT, PATCH, POST, DELETE',
        preflightContinue: true,
        optionsSuccessStatus: 204,
        credentials: true,
      },
      debug: appConfig.isDevelopment,
      playground: {
        settings: {
          'request.credentials': 'include',
        },
        // appConfig.isDevelopment
      },
      installSubscriptionHandlers: true,
      resolvers: { JSON: GraphQLJSON },
    }),

    KeycloakModule.registerAsync({
      useFactory: () => ({
        authServerUrl: `http://${appConfig.auth.keycloak.host}${appConfig.auth.keycloak.prefix}/auth`,
        realm: appConfig.auth.keycloak.realm,
        clientId: appConfig.auth.keycloak.clientId,
        secret: appConfig.auth.keycloak.clientSecret,
        clientUniqueId: appConfig.auth.keycloak.clientUniqueId,
        adminUser: appConfig.auth.keycloak.adminUsername || 'admin',
        adminPass: appConfig.auth.keycloak.adminPassword || 'pass',
        debug: appConfig.isDevelopment,
      }),
    }),
    ScheduleModule.forRoot(),
    HealthModule,
    EventModule,
    EvaluationEngineModule,
    GameModule,
    PlayerModule,
    SubmissionModule,
    HookModule,
    ChallengeModule,
    ChallengeStatusModule,
    LeaderboardModule,
    RewardModule,
    SubscriptionsModule,
  ],
  providers: [
    DateScalar,

    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
  ],
  exports: [HttpModule, KeycloakModule],
})
export class AppModule {}
