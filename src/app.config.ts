import { LoggerService, LogLevel } from '@nestjs/common';

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
  };
  evaluationEngine: string;
  queueHost: string;
  queuePort: number;
  port: number;
  host: string;
  jwt: {
    secret: string;
    expirationTime: number;
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
  evaluationEngine: process.env.EVALUATION_ENGINE,
  queueHost: process.env.REDIS_HOST,
  queuePort: parseInt(process.env.REDIS_PORT, 10),
  database: {
    protocol: 'mongodb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    authSource: process.env.DB_AUTH,
    useUnifiedTopology: true,
    useNewUrlParser: false,
    loggerLevel: process.env.DB_LOGGER_LEVEL,
  },
  port: parseInt(process.env.APP_PORT, 10),
  host: process.env.APP_HOST,
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: parseInt(process.env.JWT_EXPIRATION_TIME, 10),
  },
  logger: process.env.APP_LOGGER_LEVELS?.split(',') as LogLevel[] || ['error', 'warn'],
};
