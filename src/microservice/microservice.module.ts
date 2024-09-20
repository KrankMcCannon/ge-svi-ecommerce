import { Module } from '@nestjs/common';
import { RmqModule } from '../rmq.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Module({
  imports: [RmqModule],
  controllers: [EmailController],
  providers: [EmailService],
})
export class MicroserviceModule {}
