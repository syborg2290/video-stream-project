import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { decryptCBC } from '../decrypt';
const S3 = require('aws-sdk/clients/s3');

export const decryptMetafile = async (filename, quality, iv, key) => {
  try {
    const s3 = new S3({
      credentials: {
        accessKeyId: process.env.aws_access_key_id_qa,
        secretAccessKey: process.env.aws_secret_access_key_qa,
      },
      region: 'us-east-2',
    });

    const params = {
      Bucket: process.env.TRANSCODED_VIDEO_BUCKET,
      Key: `${filename}/${quality}.m3u8`,
    };

    const data = await new Promise((resolve, reject) => {
      s3.createBucket(
        {
          Bucket:
            process.env.TRANSCODED_VIDEO_BUCKET /* Put your bucket name */,
        },
        function () {
          s3.getObject(params, function (err, data) {
            if (err) {
              reject(err);
            } else {
              console.log('Successfully dowloaded data from  bucket');
              resolve(data);
            }
          });
        },
      );
    });

    let paramsS3 = {
      Bucket: process.env.TRANSCODED_VIDEO_BUCKET,
      Key: `${filename}/${quality}.m3u8`,
      Body: decryptCBC(data['Body'], iv, key),
    };

    await s3.putObject(paramsS3).promise();

    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.aws_access_key_id_qa,
        secretAccessKey: process.env.aws_secret_access_key_qa,
      },
      region: 'us-east-2',
    });

    const commandTranscoded = new GetObjectCommand({
      Bucket: process.env.TRANSCODED_VIDEO_BUCKET,
      Key: `${filename}/${quality}.m3u8`,
    });

    const urlTranscoded = await getSignedUrl(client, commandTranscoded, {
      expiresIn: 24 * 60 * 60,
    });

    return { message: 'Done', url: urlTranscoded };
  } catch (error) {
    console.log(error);
  }
};
