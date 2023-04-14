import { Controller, Post, Request } from '@nestjs/common';
import { DecoderService } from './decoder.service';

@Controller('decoder')
export class DecoderController {
  constructor(private readonly decoderService: DecoderService) {}

  @Post('/process')
  async decoderProcess(@Request() req) {
    const key = req.body.key;
    const semkey = req.body.semkey;
    const iv = req.body.iv;
    return this.decoderService.decodeFilename(key, semkey, iv);
  }
}
