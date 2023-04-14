import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs';
import { process360p } from 'src/utils/transcoder-quality/process360p';
import { process480p } from 'src/utils/transcoder-quality/process480p';
import { decryptMetafile } from 'src/utils/transcoder-quality/decryptMetafile';

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../../sample/videos');
const dest = path.join(__dirname, '../../sample/temp/chunks/videos');

@Injectable()
export class TranscoderService {
  constructor(private readonly httpService: HttpService) {}

  async transcodeFromStream() {
    try {
      const BASE_AWS_S3_STREAM_SERVER = process.env.AWS_S3_STREAM_SERVER_QA;
      return this.httpService
        .get(
          BASE_AWS_S3_STREAM_SERVER +
            '/download/:' +
            'Vaseegara (Cover) - Jonita Gandhi ft. Keba Jeremiah.mp4',
        )
        .pipe(
          map((res) => {
            // console.log(res.data);
            const streamData = res.data;
            return streamData;
          }),
        );
    } catch (error) {
      console.log(error);
    }
  }

  async transcodeFromPresignnedUrl() {
    try {
      const BASE_AWS_S3_STREAM_SERVER = process.env.AWS_S3_STREAM_SERVER_QA;
      return this.httpService
        .get(
          BASE_AWS_S3_STREAM_SERVER +
            '/pre-signed-url/:' +
            'Vaseegara (Cover) - Jonita Gandhi ft. Keba Jeremiah.mp4',
        )
        .pipe(
          map(async (res) => {
            const signedUrlOriginal = res.data.signedUrlOriginal;
            const signedUrlTranscoded = res.data.signedUrlTranscoded;

            return res.data.signedUrl;
          }),
        );
    } catch (error) {
      console.log(error);
    }
  }

  async trancodeFromBaseOnNetworkQuality(key: string) {
    try {
      const keyPath = key.split(':').pop();
      const res = await process480p(keyPath);
      if (res) {
        return {
          url: res.url,
          key: res.key,
          iv: res.iv,
        };
      }
    } catch (error) {
      console.log(error);
    }
  }

  async decryptHLSMetafile(
    quality: string,
    filename: string,
    key: string,
    iv: string,
  ) {
    try {
      const res = decryptMetafile(filename, quality, iv, key);
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async transcoderTest(): Promise<any> {
    try {
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      const startTime = new Date();
      console.info('> Start reading files', startTime);

      fs.readdir(dir, (readDirError, files) => {
        if (readDirError) {
          console.error(readDirError);

          return;
        }

        const countFiles = files.length;

        files.map(async (file, index) => {
          const fileName = path.join(dir, file);

          //fmpeg -i input.mp4 -vf scale=320:-1 output.mp4

          const { err, stdout, stderr } = await exec(
            `ffmpeg -i ${fileName} -vf scale=-1:720 -start_number 0 -hls_time 10 -hls_list_size 0 -f hls  ${dest}/${index}.m3u8`,
          );

          if (err) {
            // console.log(err);
          }

          if (countFiles - 1 === index) {
            const endTime = new Date();
            console.info('< End Preparing files', endTime);
          }
        });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
