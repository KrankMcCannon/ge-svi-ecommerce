import { Body, Controller, Post } from '@nestjs/common';
import { SendEmailDto } from './email-data.dto';
import { EmailProducerService } from './email-producer.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailProducerService: EmailProducerService) {}

  @Post('send')
  async sendEmail(
    @Body() sendEmailDto: SendEmailDto,
  ): Promise<{ message: string }> {
    await this.emailProducerService.sendEmailTask(sendEmailDto);
    return { message: 'Email task added to queue' };
  }
}
