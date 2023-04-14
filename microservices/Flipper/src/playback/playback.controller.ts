import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';

@Controller('playback')
export class PlaybackController {
  @Get('/process/:token')
  async playbackFlipper(@Param('token') token, @Req() req: Request) {
    console.log(`${req.protocol}://${req.get('Host')}${req.originalUrl}`);
    try {
      const url =
        'https://video-egress-bucket.s3.us-east-2.amazonaws.com/2/480p.m3u8?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIASAPAMDJH2UTGEL6T%2F20230328%2Fus-east-2%2Fs3%2Faws4_request&X-Amz-Date=20230328T064409Z&X-Amz-Expires=86400&X-Amz-Signature=cb0eb8d4a32f9727a82308e3915a4e2d36c7d304082e12d9167ad04e03435293&X-Amz-SignedHeaders=host&x-id=GetObject';

      return `
              <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
            
                <video 
                  id="video" 
                  width="100%"
                  height="100%"
                  controls
                  autoPlay
                  crossOrigin="anonymous"
                ></video>

              <script>
                var video = document.getElementById('video');

                if(Hls.isSupported()) {
                  var hls = new Hls();
                  hls.loadSource('${url}');
                  hls.attachMedia(video);
                  hls.on(Hls.Events.MANIFEST_PARSED,function() {
                    video.play();
                });
                }else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                  video.src = '${url}';
                  video.addEventListener('loadedmetadata',function() {
                    video.play();
                  });
                }
              </script>
          `;
    } catch (error) {
      console.log(error);
    }
  }
}
