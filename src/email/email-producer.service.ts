import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CustomLogger } from '../config/custom-logger';
import { SendEmailDto } from './email-data.dto';

@Injectable()
export class EmailProducerService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendEmailTask(emailData: SendEmailDto): Promise<void> {
    CustomLogger.info('Sending email task...');
    this.client.send('send_email', emailData);
    CustomLogger.info('Email task sent!');
  }
}
