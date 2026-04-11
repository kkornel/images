import { NestFactory } from '@nestjs/core';
import { ConfigType } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import appConfig from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  await app.listen(config.port);
}

bootstrap();
