/**
 * ImageProcessor - Core engine for image processing operations
 * Handles ImageData manipulation and provides utility methods
 */
export class ImageProcessor {
  /**
   * Get pixel value at (x, y) from ImageData
   * @param {ImageData} imageData - The image data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {{r: number, g: number, b: number, a: number}} RGBA pixel value
   */
  static getPixel(imageData, x, y) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    return {
      r: data[index],
      g: data[index + 1],
      b: data[index + 2],
      a: data[index + 3]
    };
  }

  /**
   * Set pixel value at (x, y) in ImageData
   * @param {ImageData} imageData - The image data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {{r: number, g: number, b: number, a: number}} pixel - RGBA pixel value
   */
  static setPixel(imageData, x, y, pixel) {
    const { width, data } = imageData;
    const index = (y * width + x) * 4;
    data[index] = pixel.r;
    data[index + 1] = pixel.g;
    data[index + 2] = pixel.b;
    data[index + 3] = pixel.a !== undefined ? pixel.a : 255;
  }

  /**
   * Clamp value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Create a new ImageData with the same dimensions
   * @param {ImageData} imageData - Source image data
   * @returns {ImageData} New ImageData with same dimensions
   */
  static createImageData(imageData) {
    return new ImageData(imageData.width, imageData.height);
  }

  /**
   * Clone ImageData
   * @param {ImageData} imageData - Source image data
   * @returns {ImageData} Cloned image data
   */
  static cloneImageData(imageData) {
    const cloned = new ImageData(imageData.width, imageData.height);
    cloned.data.set(imageData.data);
    return cloned;
  }

  /**
   * Load image from URL
   * @param {string} url - Image URL
   * @returns {Promise<ImageData>} Image data
   */
  static async loadImageFromURL(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        resolve(imageData);
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  /**
   * Load image from File object
   * @param {File} file - File object
   * @returns {Promise<ImageData>} Image data
   */
  static async loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');

          // Resize if too large (max 512x512 for performance)
          let { width, height } = img;
          const maxSize = 512;
          if (width > maxSize || height > maxSize) {
            const scale = Math.min(maxSize / width, maxSize / height);
            width = Math.floor(width * scale);
            height = Math.floor(height * scale);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, width, height);
          resolve(imageData);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert ImageData to Blob for download
   * @param {ImageData} imageData - Image data
   * @returns {Promise<Blob>} Image blob
   */
  static async imageDataToBlob(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);

    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  /**
   * Extract a rectangular region from ImageData
   * @param {ImageData} imageData - Source image
   * @param {number} x - Top-left X coordinate
   * @param {number} y - Top-left Y coordinate
   * @param {number} width - Region width
   * @param {number} height - Region height
   * @returns {ImageData} Extracted region as new ImageData
   */
  static extractRegion(imageData, x, y, width, height) {
    // Validate bounds
    if (x < 0 || y < 0 ||
        x + width > imageData.width ||
        y + height > imageData.height) {
      throw new Error('Region bounds exceed image dimensions');
    }

    if (width <= 0 || height <= 0) {
      throw new Error('Region must have positive dimensions');
    }

    // Create new ImageData for extracted region
    const extracted = new ImageData(width, height);
    const srcData = imageData.data;
    const dstData = extracted.data;

    // Copy pixels row by row (efficient direct array access)
    for (let row = 0; row < height; row++) {
      const srcRow = y + row;
      for (let col = 0; col < width; col++) {
        const srcCol = x + col;
        const srcIdx = (srcRow * imageData.width + srcCol) * 4;
        const dstIdx = (row * width + col) * 4;

        // Copy RGBA
        dstData[dstIdx] = srcData[srcIdx];
        dstData[dstIdx + 1] = srcData[srcIdx + 1];
        dstData[dstIdx + 2] = srcData[srcIdx + 2];
        dstData[dstIdx + 3] = srcData[srcIdx + 3];
      }
    }

    return extracted;
  }
}
