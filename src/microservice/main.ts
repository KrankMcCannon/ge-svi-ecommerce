import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { CustomLogger } from '../config/custom-logger';
import { EnvironmentVariables } from '../config/environment-variables';
import { MicroserviceModule } from './microservice.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MicroserviceModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [EnvironmentVariables.RABBITMQ_URI],
        queue: EnvironmentVariables.RABBITMQ_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  await app.listen();
  CustomLogger.log('Microservice is running...');
}

bootstrap();
