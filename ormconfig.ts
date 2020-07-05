import { ConnectionOptions } from 'typeorm';

const migrationsDir = '/db/migrations';

const config: ConnectionOptions = {
  type: 'mongodb',
  url: `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DATABASE_NAME}`,
  entities: [__dirname + '/**/*.entity.ts'],
  migrations: [migrationsDir + '/*.js'],
  cli: { migrationsDir },
  synchronize: true,
  useUnifiedTopology: true
};

export = config;
