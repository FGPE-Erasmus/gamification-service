import { join } from 'path';
import { Global, HttpModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLJSON } from 'graphql-type-json';

import { appConfig } from './app.config';
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
import { HookModule } from './hook/hook.module';
import { RewardModule } from './reward/reward.module';
import { EventModule } from './event/event.module';
import { EvaluationEngineModule } from './evaluation-engine/evaluation-engine.module';
import { SubscriptionsModule } from './common/subscriptions/subscriptions.module';
import { KeycloakModule } from './keycloak/keycloak.module';
import { AuthGuard } from './keycloak/guards/auth.guard';
import { ResourceGuard } from './keycloak/guards/resource.guard';

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
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: appConfig.isDevelopment,
      playground: appConfig.isDevelopment,
      installSubscriptionHandlers: true,
      resolvers: { JSON: GraphQLJSON },
    }),

    KeycloakModule.registerAsync({
      useFactory: () => ({
        authServerUrl: `http://${appConfig.auth.keycloak.host}:${appConfig.auth.keycloak.port}/auth`,
        realm: appConfig.auth.keycloak.realm,
        clientId: appConfig.auth.keycloak.clientId,
        secret: appConfig.auth.keycloak.clientSecret,
        clientUniqueId: appConfig.auth.keycloak.clientUniqueId,
        adminUser: appConfig.auth.keycloak.adminUsername || 'admin',
        adminPass: appConfig.auth.keycloak.adminPassword || 'pass',
        debug: appConfig.isDevelopment,
      }),
    }),

    HealthModule,
    EventModule,
    EvaluationEngineModule,
    UsersModule,
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
    EmailScalar,

    // This adds a global level authentication guard, you can also have it scoped
    // if you like.
    //
    // Will return a 401 unauthorized when it is unable to
    // verify the JWT token or Bearer header is missing.
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    // This adds a global level resource guard, which is permissive.
    // Only controllers annotated with @Resource and methods with @Scopes
    // are handled by this guard.
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
  ],
  exports: [KeycloakModule],
})
export class AppModule {}
