import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { DltService } from './dlt.service';

@Module({
  providers: [WhatsappService, DltService],
  exports: [WhatsappService, DltService],
})
export class WhatsappModule {}
