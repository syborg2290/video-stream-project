import { Module } from '@nestjs/common';
import { DecoderController } from './decoder.controller';
import { DecoderService } from './decoder.service';

@Module({
  imports: [],
  providers: [DecoderService],
  controllers: [DecoderController],
  exports: [DecoderService],
})
export class DecoderModule {}
