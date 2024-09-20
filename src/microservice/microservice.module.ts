import { Module } from '@nestjs/common';
import { RmqModule } from '../rmq.module';
import { EmailConsumerService } from './email-consumer.service';

@Module({
  imports: [RmqModule],
  providers: [EmailConsumerService],
})
export class MicroserviceModule {}
