import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/environment-variables';
import { getRabbitMQOptions } from './rabbitmq.config';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const swaggerConfig = new DocumentBuilder()
    .setTitle(EnvironmentVariables.SWAGGER_TITLE)
    .setDescription(EnvironmentVariables.SWAGGER_DESCRIPTION)
    .setVersion(EnvironmentVariables.SWAGGER_APP_VERSION)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  app.connectMicroservice(getRabbitMQOptions());

  await app.startAllMicroservices();

  await app.listen(EnvironmentVariables.PORT, EnvironmentVariables.IP);
}

bootstrap();
