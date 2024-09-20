import { RmqOptions, Transport } from '@nestjs/microservices';

export const rabbitMQConfig = {
  urls: ['amqp://rabbitmq:rabbitmq@localhost:5672'],
  queue: 'task_queue',
  queueOptions: {
    durable: false,
  },
};

export const getRabbitMQOptions = (): RmqOptions => ({
  transport: Transport.RMQ,
  options: rabbitMQConfig,
});
