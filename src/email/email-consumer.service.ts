import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import * as nodemailer from 'nodemailer';
import { CustomException } from 'src/config/custom-exception';
import { CustomLogger } from 'src/config/custom-logger';
import { EnvironmentVariables } from 'src/config/environment-variables';
import { Errors } from 'src/config/errors';

@Injectable()
export class EmailConsumerService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.mailgun.org',
      port: EnvironmentVariables.MAILGUN_PORT,
      auth: {
        user: EnvironmentVariables.MAILGUN_USER,
        pass: EnvironmentVariables.MAILGUN_API_KEY,
      },
    });
  }

  @EventPattern('send_email')
  async handleSendEmail(emailData: any): Promise<void> {
    try {
      CustomLogger.log('Processing email:', emailData);

      await this.sendEmail(emailData);

      CustomLogger.log('Email processing completed successfully');
    } catch (error) {
      CustomLogger.error('Failed to process email', error.message);
    }
  }

  private async sendEmail(emailData: any): Promise<void> {
    try {
      const mailOptions = {
        from: `Excited User <${EnvironmentVariables.MAILGUN_EMAIL}>`,
        to: emailData.email,
        subject: emailData.subject,
        text: emailData.message,
        html: `<h1>${emailData.message}</h1>`,
      };

      const info = await this.transporter.sendMail(mailOptions);

      CustomLogger.log(
        `Email sent to: ${emailData.email}, Info: ${info.messageId}`,
      );
    } catch (error) {
      CustomLogger.error('Error while sending email', error.message);
      CustomException.fromErrorEnum(Errors.E_0005_INTEGRITY_ERROR, {
        data: { email: emailData },
        originalError: error,
      });
    }
  }
}
