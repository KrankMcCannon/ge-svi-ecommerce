import { Module } from '@nestjs/common';
import { RmqModule } from '../rmq.module';
import { EmailProducerService } from './email-producer.service';

@Module({
  imports: [RmqModule],
  providers: [EmailProducerService],
  exports: [EmailProducerService],
})
export class EmailModule {}
