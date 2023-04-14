import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  S3Client,
  // This command supersedes the ListObjectsCommand and is the recommended way to list objects.
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { decryptCBC } from '../utils/decrypt';

const S3 = require('aws-sdk/clients/s3');

@Injectable()
export class DecoderService {
  async decodeFilename(key: string, semkey: string, iv: string) {
    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.aws_access_key_id_qa,
        secretAccessKey: process.env.aws_secret_access_key_qa,
      },
      region: 'us-east-2',
    });

    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.aws_access_key_id_qa,
        secretAccessKey: process.env.aws_secret_access_key_qa,
      },
      region: 'us-east-2',
    });

    const BUCKET = process.env.TRANSCODED_VIDEO_BUCKET;

    const command = new ListObjectsV2Command({
      Bucket: BUCKET,
      // The default and maximum number of keys returned is 1000. This limits it to
      // one for demonstration purposes.
      MaxKeys: 1,
      // Delimiter: '/',
      Prefix: key + '/',
    });
    try {
      let isTruncated = true;

      let contents = [];

      while (isTruncated) {
        const { Contents, IsTruncated, NextContinuationToken } =
          await client.send(command);
        const contentsList = Contents.map(
          (c) => `${c.Key.split(key + '/')}`,
        ).join('\n');
        // console.log(contentsList);
        // Copy the object to a new location

        const encryptedName = contentsList.split(',')[1];

        const decryptedName = decryptCBC(
          contentsList.split(',')[1],
          iv,
          semkey,
        ).result;
        if (decryptedName === null) {
          throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
        }

        contents.push({ decrypted: decryptedName, encrypted: encryptedName });
        isTruncated = IsTruncated;
        command.input.ContinuationToken = NextContinuationToken;
      }

      contents.forEach((each) => {
        s3.copyObject({
          Bucket: BUCKET,
          CopySource: `${BUCKET}/${key}/${each.encrypted}`,
          Key: key + '/' + each.decrypted,
        })
          .promise()
          .then(() => {
            // Delete the old object
            s3.deleteObject({
              Bucket: BUCKET,
              Key: key + '/' + each.encrypted,
            }).promise();
          });
      });
      return { status: 200, message: 'Done' };
      // console.log(contents);
    } catch (error) {
      throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
    }
  }
}
