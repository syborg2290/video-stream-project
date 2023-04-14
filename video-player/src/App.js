import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import './App.css'

export default function App() {
  const videoRef = useRef(null);
  const [src, setSrc] = useState(
    "http://localhost:8000/live/test/index.m3u8"
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.controls = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // This will run in safari, where HLS is supported natively
      video.src = src;
    } else if (Hls.isSupported()) {
      // This will run in all other modern browsers

      const hls = new Hls();
      hls.loadSource(src);

      hls.attachMedia(video);
    } else {
      console.error(
        "This is an old browser that does not support MSE https://developer.mozilla.org/en-US/docs/Web/API/Media_Source_Extensions_API"
      );
    }
  }, [src, videoRef]);

  return (
    <div class="video-container">
      <video
        ref={videoRef}
        id="video"
        width="100%"
        height="100%"
        controls
        autoPlay
        crossOrigin="anonymous"
      ></video>
    </div>
  );
}
