# Google Veo Frame Sequence Asset Folder

Place your extracted video frames into this directory for automatic 60 FPS scroll-driven canvas scrubbing on the hero landing page.

## File Naming Convention
The canvas preloader looks for sequential WebP/JPG files:
```text
/public/hero-frames/frame_001.webp
/public/hero-frames/frame_002.webp
/public/hero-frames/frame_003.webp
...
/public/hero-frames/frame_060.webp
```

## How to Extract Frames from Google Veo / AI Video with FFmpeg

1. Generate your cinematic video (e.g. 360° product rotation or slow camera dolly in Google Veo).
2. Run this FFmpeg command in terminal:
```bash
# Extract 60 frames in crisp, ultra-fast WebP format (scaled to 1920x1080)
ffmpeg -i veo_streetwear.mp4 -vf "fps=20,scale=1920:1080:flags=lanczos" -vcodec libwebp -lossless 0 -qscale 75 frame_%03d.webp
```
3. Copy the `frame_*.webp` files into this `/public/hero-frames/` folder.
4. The canvas hero engine in `HeroScrollSequence.tsx` will automatically detect and scrub through all frames seamlessly as you scroll!
