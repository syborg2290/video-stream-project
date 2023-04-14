import { Module } from '@nestjs/common';
import { TranscoderController } from './transcoder.controller';
import { TranscoderService } from './transcoder.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [TranscoderService],
  controllers: [TranscoderController],
  exports: [TranscoderService],
})
export class TranscoderModule {}
