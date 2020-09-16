import { NestFactory } from '@nestjs/core';
import * as helmet from 'helmet';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { appConfig } from './app.config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    credentials: true,
    origin: true,
  });
  /* app.useGlobalPipes(new ValidationPipe({
    transform: false,
    whitelist: true,
  })); */
  await app.listen(appConfig.port, appConfig.host);
}
bootstrap();
