import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';

import { DateScalar } from '../src/common/scalars/date.scalar';
import { EmailScalar } from '../src/common/scalars/email.scalar';
import { AuthResolver } from '../src/auth/auth.resolver';
import { UsersResolver } from '../src/users/users.resolver';

async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([AuthResolver, UsersResolver], [DateScalar, EmailScalar]);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'schema.gql'), printSchema(schema), 'UTF8');
}

generateSchema();
