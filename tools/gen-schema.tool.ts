import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { GraphQLSchemaBuilderModule, GraphQLSchemaFactory } from '@nestjs/graphql';
import { printSchema } from 'graphql';

import { DateScalar } from '../src/common/scalars/date.scalar';
import { EmailScalar } from '../src/common/scalars/email.scalar';

async function generateSchema() {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([], [DateScalar, EmailScalar]);
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'schema.gql'), printSchema(schema), 'UTF8');
}

generateSchema();
