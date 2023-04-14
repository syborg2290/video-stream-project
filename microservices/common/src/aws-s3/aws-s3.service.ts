import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, StreamableFile } from '@nestjs/common';
import { Readable } from 'stream';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const fs = require('fs');

@Injectable()
export class S3Service {
  private readonly client: S3Client;
  constructor() {
    this.client = new S3Client({
      credentials: {
        accessKeyId: process.env.aws_access_key_id_qa,
        secretAccessKey: process.env.aws_secret_access_key_qa,
      },
      region: 'us-east-2',
    });
  }

  async getOriginalFile(path: string): Promise<StreamableFile> {
    try {
      const command = new GetObjectCommand({
        Bucket: 'original-file-video',
        Key: path.split(':').pop(),
      });
      const data = await this.client.send(command);
      const inputStream = data.Body as Readable;
      // const downloadPath = './example.mp4';
      // const outputStream = fs.createWriteStream(downloadPath);
      // inputStream.pipe(outputStream);

      return new StreamableFile(inputStream);
    } catch (error) {
      console.log(error);
    }
  }

  async getOriginalFilePresignedUrl(path: string): Promise<any> {
    try {
      const s3 = await this.client;
      const commandOriginal = new GetObjectCommand({
        Bucket: 'original-file-video',
        Key: path.split(':').pop(),
      });
      const commandTranscoded = new PutObjectCommand({
        Bucket: 'transcoded-data-bucket',
        Key: path.split(':').pop(),
      });
      const urlOriginal = await getSignedUrl(s3, commandOriginal, {
        expiresIn: 24 * 60 * 60,
      });
      const urlTranscoded = await getSignedUrl(s3, commandTranscoded, {
        expiresIn: 24 * 60 * 60,
      });
      return {
        signedUrlOriginal: urlOriginal,
        signedUrlTranscoded: urlTranscoded,
      };
    } catch (error) {
      console.log(error);
    }
  }
}
