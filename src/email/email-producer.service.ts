import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CustomLogger } from 'src/config/custom-logger';
import { SendEmailDto } from './email-data.dto';

@Injectable()
export class EmailProducerService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendEmailTask(emailData: SendEmailDto): Promise<void> {
    CustomLogger.log('Sending email task...');
    await lastValueFrom(this.client.emit('send_email', emailData));
    CustomLogger.log('Email task sent!');
  }
}
