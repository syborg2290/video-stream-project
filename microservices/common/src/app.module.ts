import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [AwsS3Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
