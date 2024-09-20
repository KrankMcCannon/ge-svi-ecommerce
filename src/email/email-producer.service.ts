import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { Errors } from 'src/config/errors';
import { SendEmailDto } from './email-data.dto';

@Injectable()
export class EmailProducerService {
  constructor(
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  async sendEmailTask(emailData: SendEmailDto): Promise<void> {
    try {
      CustomLogger.log('Sending email task to the queue', emailData.email);

      await lastValueFrom(this.client.emit('send_email', emailData));

      CustomLogger.log('Email task successfully added to the queue');
    } catch (error) {
      CustomLogger.error(
        'Failed to send email task to the queue',
        error.message,
      );
      throw CustomException.fromErrorEnum(Errors.E_0001_GENERIC_ERROR, {
        data: { email: emailData },
        originalError: error,
      });
    }
  }
}
