import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { encryptCBC } from '../encrypt';

const S3 = require('aws-sdk/clients/s3');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const crypto = require('crypto');

export const process1080p = async (key: string, publicKey: string) => {
  const s3 = new S3({
    credentials: {
      accessKeyId: process.env.aws_access_key_id_qa,
      secretAccessKey: process.env.aws_secret_access_key_qa,
    },
    region: 'us-east-2',
  });
  try {
    const params = { Bucket: process.env.INTAKE_VIDEO_BUCKET, Key: key };
    const readStream = s3.getObject(params).createReadStream();
    var totalTime;

    // Defining key
    const semkey = crypto.randomBytes(32);

    // Defining iv
    const iv = crypto.randomBytes(16);

    fs.mkdirSync(`/tmp/1080p/${key.split('.')[0]}`, {
      recursive: true,
    });
    const result = await new Promise(function (resolve, reject) {
      ffmpeg(readStream)
        .on('start', () => {
          console.log(`transcoding ${key.split('.')[0]} to 1080p`);
        })
        .on('error', (err, stdout, stderr) => {
          console.log('stderr:', stderr);
          console.error(err);
        })
        .on('end', async () => {
          const fileUploadPromises = fs
            .readdirSync(`/tmp/1080p/${key.split('.')[0]}`)
            .map((file) => {
              let params = {
                Bucket: process.env.TRANSCODED_VIDEO_BUCKET,
                Key: `${key.split('.')[0]}/${
                  encryptCBC({ data: file, key: semkey, iv: iv }).encryptedData
                }`,
                publicKey,
                Body: fs.readFileSync(
                  `/tmp/1080p/${key.split('.')[0]}/${file}`,
                ),
              };
              console.log(`uploading ${file} to s3`);
              return s3.putObject(params).promise();
            });
          await Promise.all(fileUploadPromises);
          await fs.rmdirSync(`/tmp/1080p/${key.split('.')[0]}`, {
            recursive: true,
          });
          console.log(`tmp is deleted!`);
        })
        .on('codecData', (data) => {
          totalTime = parseInt(data.duration.replace(/:/g, ''));
        })
        .on('progress', (progress) => {
          const time = parseInt(progress.timemark.replace(/:/g, ''));
          const percent = Math.ceil((time / totalTime) * 100);
          console.log(`progress :- ${percent}%`);

          if (percent === 100) {
            resolve(100);
          }
        })
        .outputOptions([
          '-vf scale=w=1920:h=1080',
          '-c:a aac',
          '-ar 48000',
          '-b:a 192k',
          '-c:v h264',
          '-profile:v main',
          '-crf 20',
          '-g 48',
          '-keyint_min 48',
          '-sc_threshold 0',
          '-b:v 5000k',
          '-maxrate 5350k',
          '-bufsize 7500k',
          '-f hls',
          '-hls_time 4',
          '-hls_playlist_type vod',
          `-hls_segment_filename /tmp/1080p/${key.split('.')[0]}/1080p_%d.ts`,
        ])
        .output(`/tmp/1080p/${key.split('.')[0]}/1080p.m3u8`)
        .run();
    });

    if (result === 100) {
      // Generate Signed url of uploaded segment's meta file

      const client = new S3Client({
        credentials: {
          accessKeyId: process.env.aws_access_key_id_qa,
          secretAccessKey: process.env.aws_secret_access_key_qa,
        },
        region: 'us-east-2',
      });

      const commandTranscoded = new GetObjectCommand({
        Bucket: process.env.TRANSCODED_VIDEO_BUCKET,
        Key: key.split('.')[0] + '/1080p.m3u8',
      });

      const urlTranscoded = await getSignedUrl(client, commandTranscoded, {
        expiresIn: 24 * 60 * 60,
      });

      return {
        url: urlTranscoded,
        key: semkey.toString('hex'),
        iv: iv.toString('hex'),
      };
    }
  } catch (error) {
    console.log(error);
  }
};
