import { Module } from '@nestjs/common';
import { PlaybackController } from './playback.controller';
import { PlaybackService } from './playback.service';

@Module({
  imports: [],
  providers: [PlaybackService],
  controllers: [PlaybackController],
  exports: [PlaybackService],
})
export class PlaybackModule {}
