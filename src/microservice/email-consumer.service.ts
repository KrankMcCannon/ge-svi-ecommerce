import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import * as nodemailer from 'nodemailer';
import { CustomLogger } from '../config/custom-logger';
import { EnvironmentVariables } from '../config/environment-variables';
import { SendEmailDto } from '../email/email-data.dto';

@Injectable()
export class EmailConsumerService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: EnvironmentVariables.MAILGUN_HOST,
      port: EnvironmentVariables.MAILGUN_PORT,
      auth: {
        user: EnvironmentVariables.MAILGUN_USER,
        pass: EnvironmentVariables.MAILGUN_API_KEY,
      },
    });
  }

  @EventPattern('send_email')
  async handleSendEmail(emailData: SendEmailDto): Promise<void> {
    try {
      CustomLogger.log('Processing email:', emailData.email);

      await this.sendEmail(emailData);

      CustomLogger.log('Email processing completed successfully');
    } catch (error) {
      CustomLogger.error('Failed to process email', error.message);
      throw error;
    }
  }

  private async sendEmail(emailData: SendEmailDto): Promise<void> {
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
  }
}
