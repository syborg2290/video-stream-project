import { Controller, Get, Param, Res } from '@nestjs/common';
import { S3Service } from './aws-s3.service';
import type { Response } from 'express';

@Controller('s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}

  @Get('/download/:path')
  get(@Res({ passthrough: true }) res: Response, @Param('path') path: string) {
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="StreamableFile"',
    });
    return this.s3Service.getOriginalFile(path);
  }

  @Get('/pre-signed-url/:path')
  getPreSignedUrl(@Param('path') path: string) {
    return this.s3Service.getOriginalFilePresignedUrl(path);
  }
}
