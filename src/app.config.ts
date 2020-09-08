import { ConnectionOptions } from 'typeorm';

interface IAppConfig {
  version: string;
  name: string;
  uuid: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTesting: boolean;
  assetsPath: string;
  database: ConnectionOptions;
  evaluationEngine: string;
  queueHost: string;
  queuePort: number;
  port: number;
  host: string;
  jwt: {
    secret: string;
    expirationTime: number;
  };
  logger: {
    level: string;
    transports?: any[];
  };
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
    type: 'mongodb',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    authSource: process.env.DB_AUTH,

    synchronize: true,
    useUnifiedTopology: true,
    logging: 'all',
    migrationsRun: true,
    migrations: [__dirname + '/migrations/*{.ts,.js}'],
    cli: {
      migrationsDir: __dirname + '/migrations',
    },
    entities: [__dirname + '/**/entities/*.entity{.ts,.js}'],
  },
  port: parseInt(process.env.APP_PORT, 10),
  host: process.env.APP_HOST,
  jwt: {
    secret: process.env.JWT_SECRET,
    expirationTime: parseInt(process.env.JWT_EXPIRATION_TIME, 10),
  },
  logger: {
    level: process.env.APP_LOGGER_LEVEL,
  },
};
