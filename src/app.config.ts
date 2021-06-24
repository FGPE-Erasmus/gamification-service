import { LoggerService, LogLevel } from '@nestjs/common';
import { JobOptions } from 'bull';
import * as path from 'path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require('dotenv').config({ path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'dev'}`) });

interface IAppConfig {
  version: string;
  name: string;
  uuid: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTesting: boolean;
  assetsPath: string;
  auth: {
    keycloak: {
      url: string;
      realm: string;
      clientUniqueId: string;
      clientId: string;
      clientSecret: string;
      adminUsername: string;
      adminPassword: string;
      cookieKey: string;
    };
  };
  database: {
    protocol: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    authSource: string;
    loggerLevel: string;
    useNewUrlParser: boolean;
    useUnifiedTopology: boolean;
    useCreateIndex: boolean;
  };
  messageBroker: {
    host: string;
    port: number;
  };
  cacheManager: {
    host: string;
    port: number;
    ttl: number;
  };
  evaluationEngine: {
    protocol: string;
    host: string;
    port: number;
    urlPrefix: string;
    username: string;
    password: string;
  };
  port: number;
  host: string;
  http: {
    timeout: number;
    maxRedirects: number;
  };
  queue: {
    event: {
      name: string;
      jobOptions: JobOptions;
    };
    evaluation: {
      name: string;
      jobOptions: JobOptions;
    };
    notifications: {
      name: string;
      jobOptions: JobOptions;
    };
  };
  generatedTokens: {
    timeout: number;
    secret: string;
  };
  logger: LoggerService | LogLevel[] | boolean;
}

export const appConfig: IAppConfig = {
  name: process.env.APP_NAME,
  version: process.env.APP_VERSION,
  uuid: process.env.APP_UUID,
  isProduction: process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'prod',
  isDevelopment: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev',
  isTesting: process.env.NODE_ENV === 'test',
  assetsPath: `${__dirname}/../assets`,
  auth: {
    keycloak: {
      url: process.env.AUTH_KEYCLOAK_URL || 'localhost:8080',
      realm: process.env.AUTH_KEYCLOAK_REALM || 'master',
      clientUniqueId: process.env.AUTH_KEYCLOAK_CLIENT_UNIQUE_ID || '00000000-0000-0000-0000-000000000000',
      clientId: process.env.AUTH_KEYCLOAK_CLIENT_ID || 'client_id',
      clientSecret: process.env.AUTH_KEYCLOAK_CLIENT_SECRET || 'client_secret',
      adminUsername: process.env.AUTH_KEYCLOAK_ADMIN_USERNAME || 'admin',
      adminPassword: process.env.AUTH_KEYCLOAK_ADMIN_PASSWORD || 'pass',
      cookieKey: process.env.AUTH_KEYCLOAK_COOKIE_KEY || 'KEYCLOAK_JWT',
    },
  },
  database: {
    protocol: 'mongodb',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    authSource: process.env.DB_AUTH,
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    loggerLevel: process.env.DB_LOGGER_LEVEL,
  },
  messageBroker: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
  },
  cacheManager: {
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    ttl: 60 * 60, // 60 minutes
  },
  evaluationEngine: {
    protocol: process.env.EE_PROTOCOL,
    host: process.env.EE_HOST,
    port: +process.env.EE_PORT,
    urlPrefix: process.env.EE_URL_PREFIX,
    username: process.env.EE_USERNAME,
    password: process.env.EE_PASSWORD,
  },
  port: 3000,
  host: '0.0.0.0',
  http: {
    timeout: +process.env.HTTP_TIMEOUT || 5000,
    maxRedirects: +process.env.HTTP_MAX_REDIRECTS || 5,
  },
  queue: {
    event: {
      name: 'EVENT_QUEUE',
      jobOptions: {
        attempts: 5,
        backoff: 2000,
      },
    },
    evaluation: {
      name: 'EVALUATION_QUEUE',
      jobOptions: {
        attempts: 10,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    },
    notifications: {
      name: 'NOTIFICATIONS_QUEUE',
      jobOptions: {
        attempts: 5,
        backoff: 2000,
      },
    },
  },
  generatedTokens: {
    timeout: +process.env.APP_TOKENS_TIMEOUT || 30 * 24 * 3600, // 30 days
    secret: process.env.APP_TOKENS_SECRET || 'FGPE',
  },
  logger: (process.env.APP_LOGGER_LEVELS?.split(',') as LogLevel[]) || ['error', 'warn'],
};
