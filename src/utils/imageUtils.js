import { ImageProcessor } from '../core/ImageProcessor';

/**
 * Image utility functions
 */

/**
 * Resize image to fit within max dimensions (downscale only)
 * @param {ImageData} imageData - Source image data
 * @param {number} maxWidth - Maximum width
 * @param {number} maxHeight - Maximum height
 * @returns {ImageData} Resized image data
 */
export function resizeImage(imageData, maxWidth, maxHeight) {
  const { width, height } = imageData;

  // Calculate new dimensions
  let newWidth = width;
  let newHeight = height;

  if (width > maxWidth || height > maxHeight) {
    const scale = Math.min(maxWidth / width, maxHeight / height);
    newWidth = Math.floor(width * scale);
    newHeight = Math.floor(height * scale);
  }

  // If no resize needed, return original
  if (newWidth === width && newHeight === height) {
    return imageData;
  }

  // Resize using canvas
  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.putImageData(imageData, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = newWidth;
  dstCanvas.height = newHeight;
  const dstCtx = dstCanvas.getContext('2d');
  dstCtx.drawImage(srcCanvas, 0, 0, newWidth, newHeight);

  return dstCtx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Resize image to fit within target dimensions (both up and down), preserving aspect ratio
 * @param {ImageData} imageData - Source image data
 * @param {number} targetWidth - Target width
 * @param {number} targetHeight - Target height
 * @returns {ImageData} Resized image data
 */
export function resizeToTarget(imageData, targetWidth, targetHeight) {
  const { width, height } = imageData;

  const scale = Math.min(targetWidth / width, targetHeight / height);
  const newWidth = Math.max(1, Math.floor(width * scale));
  const newHeight = Math.max(1, Math.floor(height * scale));

  if (newWidth === width && newHeight === height) {
    return imageData;
  }

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = width;
  srcCanvas.height = height;
  const srcCtx = srcCanvas.getContext('2d');
  srcCtx.putImageData(imageData, 0, 0);

  const dstCanvas = document.createElement('canvas');
  dstCanvas.width = newWidth;
  dstCanvas.height = newHeight;
  const dstCtx = dstCanvas.getContext('2d');
  dstCtx.imageSmoothingEnabled = false;
  dstCtx.drawImage(srcCanvas, 0, 0, newWidth, newHeight);

  return dstCtx.getImageData(0, 0, newWidth, newHeight);
}

/**
 * Download image data as PNG file
 * @param {ImageData} imageData - Image data to download
 * @param {string} filename - Filename for download
 */
export async function downloadImage(imageData, filename = 'processed-image.png') {
  const blob = await ImageProcessor.imageDataToBlob(imageData);
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/**
 * Create a sample gradient image for testing
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {ImageData} Gradient image
 */
export function createGradientImage(width = 256, height = 256) {
  const imageData = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      imageData.data[index] = (x / width) * 255; // R
      imageData.data[index + 1] = (y / height) * 255; // G
      imageData.data[index + 2] = 128; // B
      imageData.data[index + 3] = 255; // A
    }
  }

  return imageData;
}

/**
 * Create a checkerboard pattern for testing
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {number} squareSize - Size of each square
 * @returns {ImageData} Checkerboard image
 */
export function createCheckerboard(width = 256, height = 256, squareSize = 32) {
  const imageData = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      const isWhite = (Math.floor(x / squareSize) + Math.floor(y / squareSize)) % 2 === 0;
      const value = isWhite ? 255 : 0;

      imageData.data[index] = value;
      imageData.data[index + 1] = value;
      imageData.data[index + 2] = value;
      imageData.data[index + 3] = 255;
    }
  }

  return imageData;
}

/**
 * Convert an image to grayscale
 * @param {ImageData} imageData - Source image data
 * @returns {ImageData} Grayscale image data
 */
export function convertToGrayscale(imageData) {
  const { width, height } = imageData;
  const grayscaleData = new ImageData(width, height);

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];

    // Use luminosity method for better perceived brightness
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;

    grayscaleData.data[i] = gray;
    grayscaleData.data[i + 1] = gray;
    grayscaleData.data[i + 2] = gray;
    grayscaleData.data[i + 3] = imageData.data[i + 3]; // Preserve alpha
  }

  return grayscaleData;
}
