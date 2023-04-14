import { Controller, Param, Post, Request, Response } from '@nestjs/common';
import { TranscoderService } from './transcoder.service';

const fs = require('fs');

@Controller('transcoder')
export class TranscoderController {
  constructor(private readonly transcoderService: TranscoderService) {}

  @Post('/process')
  async transcoderProcess() {
    return this.transcoderService.transcodeFromStream();
  }

  @Post('/process/decrypt')
  async transcoderDecrypt(@Request() req) {
    const filename = req.body.filename;
    const quality = req.body.quality;
    const key = req.body.key;
    const iv = req.body.iv;
    return this.transcoderService.decryptHLSMetafile(
      quality,
      filename,
      key,
      iv,
    );
  }

  @Post('/process/videoQualities')
  async transcoderProcessVideoQualities(@Request() req) {
    const key = req.body.key;

    return this.transcoderService.trancodeFromBaseOnNetworkQuality(key);
  }

  @Post('/process/test')
  async transcoderProcessTest() {
    return this.transcoderService.transcodeFromStream();
  }

  @Post('/process/test/originalFile')
  async transcoderProcessOriginalFile() {
    return this.transcoderService.transcodeFromPresignnedUrl();
  }

  @Post('/process/test')
  async transcoderTest(@Request() req, @Response() res) {
    return await this.transcoderService.transcoderTest();
  }

  @Post('/broadcaster')
  async transcoderBroadcasterFromSignedUrl(@Request() req, @Response() res) {
    fs.readFile(req.body.url, function (error, content) {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      if (error) {
        if (error.code == 'ENOENT') {
          console.log(error.code);
        } else {
          res.writeHead(500);
          res.end(
            'Sorry, check with the site admin for error: ' +
              error.code +
              ' ..\n',
          );
          res.end();
        }
      } else {
        res.end(content, 'utf-8');
      }
    });
  }

  @Post('/broadcaster/test')
  async transcoderBroadcasterTest(@Request() req, @Response() res) {
    console.log('request starting...');

    var filePath = '../../sample/temp/chunks/videos' + req.url;

    fs.readFile(filePath, function (error, content) {
      res.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
      if (error) {
        if (error.code == 'ENOENT') {
          console.log(error.code);
        } else {
          res.writeHead(500);
          res.end(
            'Sorry, check with the site admin for error: ' +
              error.code +
              ' ..\n',
          );
          res.end();
        }
      } else {
        res.end(content, 'utf-8');
      }
    });
  }
}
