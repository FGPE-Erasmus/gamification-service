import { LoggerService, LogLevel } from '@nestjs/common';
import { JobOptions } from 'bull';

interface IAppConfig {
  version: string;
  name: string;
  uuid: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTesting: boolean;
  assetsPath: string;
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
  jwt: {
    secret: string;
    expirationTime: number;
  };
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
  evaluationEngine: {
    protocol: process.env.EE_PROTOCOL,
    host: process.env.EE_HOST,
    port: +process.env.EE_PORT,
    urlPrefix: process.env.EE_URL_PREFIX,
    username: process.env.EE_USERNAME,
    password: process.env.EE_PASSWORD,
  },
  port: +process.env.APP_PORT,
  host: process.env.APP_HOST,
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: +process.env.JWT_EXPIRATION_TIME,
  },
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
  },
  logger: (process.env.APP_LOGGER_LEVELS?.split(',') as LogLevel[]) || ['error', 'warn'],
};
