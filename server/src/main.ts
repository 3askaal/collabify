import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { CONFIG } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(CONFIG.PORT);
}

bootstrap();
