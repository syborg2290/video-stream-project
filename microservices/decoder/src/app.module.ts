import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DecoderModule } from './decoder/decoder.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [DecoderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
