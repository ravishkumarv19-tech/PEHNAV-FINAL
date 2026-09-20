// hero-frames.ts — Scroll-driven canvas animation frame sequence manager & preloader
// Built for high-performance 60fps scrubbable street-culture video/frame sequences (Google Veo, 3D renders, etc.)

export interface FrameSequenceConfig {
  frameCount: number;
  framePathPattern: (index: number) => string;
  fallbackImages: string[];
}

export const HERO_FRAME_CONFIG: FrameSequenceConfig = {
  // 15-second cinematic streetwear sequence (240 ultra-sharp 1080p frames)
  frameCount: 240,
  
  // File pattern for Google Veo exported frames in /public/hero-frames/
  // E.g. /hero-frames/frame_001.webp to /hero-frames/frame_060.webp
  framePathPattern: (index: number) => {
    const padded = String(index + 1).padStart(3, "0");
    return `/hero-frames/frame_${padded}.webp`;
  },

  // Fallback high-res curated streetwear shots when custom frame folder isn't populated
  fallbackImages: [
    "/assets/modern-hero.jpg",
    "/assets/modern-jacket.jpg",
    "/assets/modern-hoodie.jpg",
    "/assets/modern-tee.jpg",
    "/assets/modern-campaign.jpg",
  ],
};

/**
 * Preloads an array of image URLs and tracks progress percentage
 */
export async function preloadFrameSequence(
  urls: string[],
  onProgress?: (loaded: number, total: number, percent: number) => void
): Promise<HTMLImageElement[]> {
  let loadedCount = 0;
  const total = urls.length;
  const images: HTMLImageElement[] = new Array(total);

  return new Promise((resolve) => {
    if (total === 0) {
      resolve([]);
      return;
    }

    const checkComplete = () => {
      loadedCount++;
      const percent = Math.round((loadedCount / total) * 100);
      onProgress?.(loadedCount, total, percent);
      if (loadedCount >= total) {
        resolve(images);
      }
    };

    urls.forEach((url, index) => {
      const img = new Image();
      if (url.startsWith("http://") || url.startsWith("https://")) {
        img.crossOrigin = "anonymous";
      }
      img.src = url;
      img.onload = () => {
        images[index] = img;
        checkComplete();
      };
      img.onerror = () => {
        // If specific frame missing, mark as loaded to prevent deadlock
        images[index] = null as unknown as HTMLImageElement;
        checkComplete();
      };
    });
  });
}

/**
 * Helper to draw an image onto an HTML5 Canvas with 'object-fit: cover' mathematics
 * and Retina (devicePixelRatio) sharpness.
 */
export function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource,
  canvasWidth: number,
  canvasHeight: number,
  scale: number = 1.0,
  panY: number = 0
) {
  const imgWidth = (img as HTMLImageElement).naturalWidth || (img as HTMLCanvasElement).width || canvasWidth;
  const imgHeight = (img as HTMLImageElement).naturalHeight || (img as HTMLCanvasElement).height || canvasHeight;

  const canvasAspect = canvasWidth / canvasHeight;
  const imgAspect = imgWidth / imgHeight;

  let drawWidth = canvasWidth;
  let drawHeight = canvasHeight;
  let offsetX = 0;
  let offsetY = 0;

  if (imgAspect > canvasAspect) {
    // Image is wider than canvas
    drawHeight = canvasHeight * scale;
    drawWidth = drawHeight * imgAspect;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = (canvasHeight - drawHeight) / 2 + panY;
  } else {
    // Image is taller than canvas
    drawWidth = canvasWidth * scale;
    drawHeight = drawWidth / imgAspect;
    offsetX = (canvasWidth - drawWidth) / 2;
    offsetY = (canvasHeight - drawHeight) / 2 + panY;
  }

  // Exact integer pixel rounding prevents subpixel blur
  ctx.drawImage(
    img,
    Math.round(offsetX),
    Math.round(offsetY),
    Math.round(drawWidth),
    Math.round(drawHeight)
  );
}

/**
 * Optional film grain and futuristic streetwear coordinate overlay for the canvas
 */
export function drawCinematicHUD(
  _ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  _progress: number,
  _frameIndex: number,
  _totalFrames: number,
  _dpr: number = 1
) {
  // No-op: Clean unobstructed cinematic viewport
}
