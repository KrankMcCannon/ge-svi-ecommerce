import { Injectable } from '@nestjs/common';
import { CustomLogger } from '../config/custom-logger';
import { SendEmailDto } from '../email/email-data.dto';

@Injectable()
export class EmailService {
  async sendEmail(emailData: SendEmailDto): Promise<void> {
    CustomLogger.info(`Email sent to: ${emailData.email}`);
  }
}
