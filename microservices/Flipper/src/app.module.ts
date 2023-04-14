import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PlaybackModule } from './playback/playback.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [PlaybackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
