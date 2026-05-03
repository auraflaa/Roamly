'use client';

export const COMMUNITY_IMAGE_LIMIT_BYTES = 620 * 1024;
export const AVATAR_IMAGE_LIMIT_BYTES = 220 * 1024;
export const GEM_IMAGE_LIMIT_BYTES = 640 * 1024;
export const MAX_SOURCE_IMAGE_BYTES = 10 * 1024 * 1024;

type CompressionOptions = {
  maxBytes: number;
  maxWidth?: number;
  maxHeight?: number;
  initialQuality?: number;
};

export function getUtf8Bytes(value: string) {
  return new Blob([value]).size;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read this image.'));
    };
    image.src = url;
  });
}

function getCanvasSize(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
  scale = 1,
) {
  const ratio = Math.min(maxWidth / width, maxHeight / height, 1) * scale;
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number) {
  const webp = canvas.toDataURL('image/webp', quality);
  if (webp.startsWith('data:image/webp')) {
    return webp;
  }

  return canvas.toDataURL('image/jpeg', quality);
}

export async function compressImageForFirestore(
  file: File,
  {
    maxBytes,
    maxWidth = 900,
    maxHeight = 900,
    initialQuality = 0.78,
  }: CompressionOptions,
) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (file.size > MAX_SOURCE_IMAGE_BYTES) {
    throw new Error(`Please choose an image under ${formatBytes(MAX_SOURCE_IMAGE_BYTES)}.`);
  }

  const image = await loadImage(file);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Your browser could not prepare this image.');
  }

  const qualities = [initialQuality, 0.68, 0.58, 0.48, 0.38, 0.3];
  const scales = [1, 0.86, 0.72, 0.6, 0.5, 0.42];

  let bestDataUrl = '';
  let bestSize = Number.POSITIVE_INFINITY;

  for (const scale of scales) {
    const size = getCanvasSize(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight, scale);
    canvas.width = size.width;
    canvas.height = size.height;
    context.clearRect(0, 0, size.width, size.height);
    context.drawImage(image, 0, 0, size.width, size.height);

    for (const quality of qualities) {
      const dataUrl = canvasToDataUrl(canvas, quality);
      const byteSize = getUtf8Bytes(dataUrl);

      if (byteSize < bestSize) {
        bestDataUrl = dataUrl;
        bestSize = byteSize;
      }

      if (byteSize <= maxBytes) {
        return { dataUrl, byteSize, width: size.width, height: size.height };
      }
    }
  }

  throw new Error(
    `This image compresses to ${formatBytes(bestSize)}. Please choose one under ${formatBytes(maxBytes)}.`,
  );
}
