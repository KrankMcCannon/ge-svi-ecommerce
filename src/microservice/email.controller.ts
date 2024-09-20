import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @MessagePattern('send_email')
  async sendEmail(@Payload() data: any): Promise<void> {
    await this.emailService.sendEmail(data);
  }
}
