import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TranscoderModule } from './transcoder/transcoder.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [TranscoderModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
