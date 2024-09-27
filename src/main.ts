import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { green, yellow } from 'cli-color';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.enableCors();

  const configService = app.get(ConfigService);
  app.use(cookieParser());

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const PORT = configService.get('PORT') || 5000;

  await app.listen(PORT, () => {
    console.log(`${yellow('RUNNING ON PORT:')} ${green(PORT)}`);
  });
}
bootstrap();
