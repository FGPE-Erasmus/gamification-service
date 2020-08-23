import { join } from 'path';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';

import { appConfig } from './app.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DateScalar } from './common/scalars/date.scalar';
import { EmailScalar } from './common/scalars/email.scalar';
import { HealthModule } from './healthcheck/healthcheck.module';
import { GameModule } from './game/game.module';
import { ChallengeModule } from './challenge/challenge.module';
import { ChallengeStatusModule } from './challenge-status/challenge-status.module';
import { GraphQLJSON } from 'graphql-type-json';
import { SubmissionModule } from './submission/submission.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { PlayerLeaderboardModule } from './player-leaderboard/player-leaderboard.module';
import { PlayerModule } from './player/player.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(appConfig.database),
    GraphQLModule.forRoot({
      context: ({ req, res }) => ({ req, res }),
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      debug: appConfig.isDevelopment,
      playground: appConfig.isDevelopment,
      installSubscriptionHandlers: true,
      resolvers: { JSON: GraphQLJSON },
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    GameModule,
    ChallengeModule,
    ChallengeStatusModule,
    LeaderboardModule,
    PlayerLeaderboardModule,
    PlayerModule,
    SubmissionModule,
  ],
  providers: [DateScalar, EmailScalar],
})
export class AppModule {}
