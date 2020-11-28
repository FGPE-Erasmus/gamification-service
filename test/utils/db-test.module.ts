import { DynamicModule } from '@nestjs/common';
import { MongooseModule, MongooseModuleOptions } from '@nestjs/mongoose';
import { MongoClient } from 'mongodb';

/*let mongod: MongoMemoryServer;*/
let connection;
let db;

export default (customOpts: MongooseModuleOptions = {}): DynamicModule =>
  MongooseModule.forRootAsync({
    useFactory: async () => {
      connection = await MongoClient.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      db = await connection.db();
      return {
        uri: process.env.MONGO_URL,
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
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
        ...customOpts,
      };
    },
  });

export const cleanupMongo = async (collection: string): Promise<void> => {
  db.collection(collection).deleteMany({});
};

export const closeMongoConnection = async (): Promise<void> => {
  if (connection) {
    await connection.close();
  }
};
