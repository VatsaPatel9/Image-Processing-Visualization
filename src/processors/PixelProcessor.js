import { ImageProcessor } from '../core/ImageProcessor.js';

/**
 * PixelProcessor - Handles pixel-level operations
 */
export class PixelProcessor {
  /**
   * Convert image to grayscale
   * @param {ImageData} inputData - Input image data
   * @param {string} method - Method: 'luminosity', 'average', or 'lightness'
   * @returns {ImageData} Grayscale image
   */
  static toGrayscale(inputData, method = 'luminosity') {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = ImageProcessor.getPixel(inputData, x, y);
        let gray;

        switch (method) {
          case 'luminosity':
            // Weighted average based on human perception
            gray = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
            break;
          case 'average':
            // Simple average
            gray = (pixel.r + pixel.g + pixel.b) / 3;
            break;
          case 'lightness':
            // Average of max and min
            gray = (Math.max(pixel.r, pixel.g, pixel.b) + Math.min(pixel.r, pixel.g, pixel.b)) / 2;
            break;
          default:
            gray = pixel.r; // Fallback
        }

        gray = Math.round(gray);
        ImageProcessor.setPixel(output, x, y, {
          r: gray,
          g: gray,
          b: gray,
          a: pixel.a
        });
      }
    }

    return output;
  }

  /**
   * Adjust brightness
   * @param {ImageData} inputData - Input image data
   * @param {number} amount - Amount to adjust (-100 to +100)
   * @returns {ImageData} Brightness-adjusted image
   */
  static adjustBrightness(inputData, amount) {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = ImageProcessor.getPixel(inputData, x, y);

        ImageProcessor.setPixel(output, x, y, {
          r: ImageProcessor.clamp(pixel.r + amount, 0, 255),
          g: ImageProcessor.clamp(pixel.g + amount, 0, 255),
          b: ImageProcessor.clamp(pixel.b + amount, 0, 255),
          a: pixel.a
        });
      }
    }

    return output;
  }

  /**
   * Adjust contrast
   * @param {ImageData} inputData - Input image data
   * @param {number} factor - Contrast factor (1 = no change, >1 = more contrast, <1 = less contrast)
   * @returns {ImageData} Contrast-adjusted image
   */
  static adjustContrast(inputData, factor) {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = ImageProcessor.getPixel(inputData, x, y);

        // Contrast formula: (value - 128) * factor + 128
        ImageProcessor.setPixel(output, x, y, {
          r: ImageProcessor.clamp(Math.round((pixel.r - 128) * factor + 128), 0, 255),
          g: ImageProcessor.clamp(Math.round((pixel.g - 128) * factor + 128), 0, 255),
          b: ImageProcessor.clamp(Math.round((pixel.b - 128) * factor + 128), 0, 255),
          a: pixel.a
        });
      }
    }

    return output;
  }

  /**
   * Apply binary threshold
   * @param {ImageData} inputData - Input image data
   * @param {number} threshold - Threshold value (0-255)
   * @returns {ImageData} Thresholded image
   */
  static applyThreshold(inputData, threshold) {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = ImageProcessor.getPixel(inputData, x, y);

        // Convert to grayscale first (using luminosity)
        const gray = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;

        // Apply threshold
        const value = gray > threshold ? 255 : 0;

        ImageProcessor.setPixel(output, x, y, {
          r: value,
          g: value,
          b: value,
          a: pixel.a
        });
      }
    }

    return output;
  }

  /**
   * Invert colors
   * @param {ImageData} inputData - Input image data
   * @returns {ImageData} Inverted image
   */
  static invertColors(inputData) {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pixel = ImageProcessor.getPixel(inputData, x, y);

        ImageProcessor.setPixel(output, x, y, {
          r: 255 - pixel.r,
          g: 255 - pixel.g,
          b: 255 - pixel.b,
          a: pixel.a
        });
      }
    }

    return output;
  }

  /**
   * Calculate pixel operation result for visualization
   * @param {ImageData} inputData - Input image data
   * @param {string} operation - Operation type
   * @param {object} params - Operation parameters
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {object} Calculation details
   */
  static calculateAtPixel(inputData, operation, params, x, y) {
    const pixel = ImageProcessor.getPixel(inputData, x, y);
    let result;
    let formula;

    switch (operation) {
      case 'toGrayscale': {
        let gray;
        if (params.method === 'average') {
          gray = (pixel.r + pixel.g + pixel.b) / 3;
          formula = `(${pixel.r} + ${pixel.g} + ${pixel.b}) / 3 = ${Math.round(gray)}`;
        } else {
          gray = 0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b;
          formula = `0.299×${pixel.r} + 0.587×${pixel.g} + 0.114×${pixel.b} = ${Math.round(gray)}`;
        }
        gray = Math.round(gray);
        result = { r: gray, g: gray, b: gray };
        break;
      }
      case 'adjustBrightness': {
        const amt = params.amount ?? 0;
        result = {
          r: ImageProcessor.clamp(pixel.r + amt, 0, 255),
          g: ImageProcessor.clamp(pixel.g + amt, 0, 255),
          b: ImageProcessor.clamp(pixel.b + amt, 0, 255)
        };
        formula = `RGB(${pixel.r}, ${pixel.g}, ${pixel.b}) + ${amt} = RGB(${result.r}, ${result.g}, ${result.b})`;
        break;
      }
      case 'adjustContrast': {
        const f = params.factor ?? 1;
        result = {
          r: ImageProcessor.clamp(Math.round((pixel.r - 128) * f + 128), 0, 255),
          g: ImageProcessor.clamp(Math.round((pixel.g - 128) * f + 128), 0, 255),
          b: ImageProcessor.clamp(Math.round((pixel.b - 128) * f + 128), 0, 255)
        };
        formula = `(RGB(${pixel.r}, ${pixel.g}, ${pixel.b}) − 128) × ${f} + 128 = RGB(${result.r}, ${result.g}, ${result.b})`;
        break;
      }
      case 'applyThreshold': {
        const thresh = params.threshold ?? 128;
        const gray = Math.round(0.299 * pixel.r + 0.587 * pixel.g + 0.114 * pixel.b);
        const value = gray > thresh ? 255 : 0;
        result = { r: value, g: value, b: value };
        formula = `gray(${gray}) ${gray > thresh ? '>' : '≤'} ${thresh} → ${value}`;
        break;
      }
      case 'invertColors':
        result = {
          r: 255 - pixel.r,
          g: 255 - pixel.g,
          b: 255 - pixel.b
        };
        formula = `255 − RGB(${pixel.r}, ${pixel.g}, ${pixel.b}) = RGB(${result.r}, ${result.g}, ${result.b})`;
        break;
      default:
        result = pixel;
        formula = 'N/A';
    }

    return { input: pixel, result, formula };
  }
}
