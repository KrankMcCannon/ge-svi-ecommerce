import { Module } from '@nestjs/common';
import { EmailProducerService } from './email-producer.service';

@Module({
  providers: [EmailProducerService],
  exports: [EmailProducerService],
})
export class EmailModule {}
