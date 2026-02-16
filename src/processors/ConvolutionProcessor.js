import { ImageProcessor } from '../core/ImageProcessor.js';

/**
 * ConvolutionProcessor - Handles all convolution-based operations
 */
export class ConvolutionProcessor {
  /**
   * Apply a kernel to an image via convolution
   * @param {ImageData} inputData - Input image data
   * @param {number[][]} kernel - NxN kernel matrix (must be square and odd-sized)
   * @param {boolean} normalize - Whether to normalize the kernel
   * @returns {ImageData} Processed image data
   */
  static applyKernel(inputData, kernel, normalize = true) {
    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);

    // Normalize kernel if requested
    let processedKernel = kernel;
    if (normalize) {
      processedKernel = this.normalizeKernel(kernel);
    }

    // Apply convolution
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0;

        // Apply kernel to neighborhood
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const pixelX = x + kx - offset;
            const pixelY = y + ky - offset;

            // Zero-padding boundary handling
            if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
              const pixel = ImageProcessor.getPixel(inputData, pixelX, pixelY);
              const kernelValue = processedKernel[ky][kx];

              r += pixel.r * kernelValue;
              g += pixel.g * kernelValue;
              b += pixel.b * kernelValue;
            }
          }
        }

        // Clamp and set output pixel (preserve original alpha)
        const originalPixel = ImageProcessor.getPixel(inputData, x, y);
        ImageProcessor.setPixel(output, x, y, {
          r: ImageProcessor.clamp(Math.round(r), 0, 255),
          g: ImageProcessor.clamp(Math.round(g), 0, 255),
          b: ImageProcessor.clamp(Math.round(b), 0, 255),
          a: originalPixel.a
        });
      }
    }

    return output;
  }

  /**
   * Apply Sobel combined (both horizontal and vertical)
   * @param {ImageData} inputData - Input image data
   * @returns {ImageData} Edge-detected image
   */
  static applySobelCombined(inputData) {
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];

    const sobelY = [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ];

    const { width, height } = inputData;
    const output = ImageProcessor.createImageData(inputData);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let gx_r = 0, gx_g = 0, gx_b = 0;
        let gy_r = 0, gy_g = 0, gy_b = 0;

        // Apply both kernels
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const pixelX = x + kx - 1;
            const pixelY = y + ky - 1;

            if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
              const pixel = ImageProcessor.getPixel(inputData, pixelX, pixelY);

              // Horizontal gradient
              gx_r += pixel.r * sobelX[ky][kx];
              gx_g += pixel.g * sobelX[ky][kx];
              gx_b += pixel.b * sobelX[ky][kx];

              // Vertical gradient
              gy_r += pixel.r * sobelY[ky][kx];
              gy_g += pixel.g * sobelY[ky][kx];
              gy_b += pixel.b * sobelY[ky][kx];
            }
          }
        }

        // Compute gradient magnitude: sqrt(gx^2 + gy^2)
        const magnitude_r = Math.sqrt(gx_r * gx_r + gy_r * gy_r);
        const magnitude_g = Math.sqrt(gx_g * gx_g + gy_g * gy_g);
        const magnitude_b = Math.sqrt(gx_b * gx_b + gy_b * gy_b);

        const originalPixel = ImageProcessor.getPixel(inputData, x, y);
        ImageProcessor.setPixel(output, x, y, {
          r: ImageProcessor.clamp(Math.round(magnitude_r), 0, 255),
          g: ImageProcessor.clamp(Math.round(magnitude_g), 0, 255),
          b: ImageProcessor.clamp(Math.round(magnitude_b), 0, 255),
          a: originalPixel.a
        });
      }
    }

    return output;
  }

  /**
   * Normalize a kernel (divide by sum)
   * @param {number[][]} kernel - Input kernel
   * @returns {number[][]} Normalized kernel
   */
  static normalizeKernel(kernel) {
    const sum = kernel.flat().reduce((acc, val) => acc + val, 0);

    // If sum is 0 or 1, don't normalize
    if (sum === 0 || sum === 1) return kernel;

    return kernel.map(row => row.map(val => val / sum));
  }

  /**
   * Calculate convolution result for a single pixel (for visualization)
   * @param {ImageData} inputData - Input image data
   * @param {number[][]} kernel - Kernel matrix (NxN, must be square and odd-sized)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} normalize - Whether to normalize
   * @returns {object} Calculation details
   */
  static calculateAtPixel(inputData, kernel, x, y, normalize = true) {
    const { width, height } = inputData;
    const processedKernel = normalize ? this.normalizeKernel(kernel) : kernel;
    const kernelSize = kernel.length;
    const offset = Math.floor(kernelSize / 2);

    let r = 0, g = 0, b = 0;
    const steps = [];

    for (let ky = 0; ky < kernelSize; ky++) {
      for (let kx = 0; kx < kernelSize; kx++) {
        const pixelX = x + kx - offset;
        const pixelY = y + ky - offset;

        if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
          const pixel = ImageProcessor.getPixel(inputData, pixelX, pixelY);
          const kernelValue = processedKernel[ky][kx];

          steps.push({
            pixel,
            kernelValue,
            position: { x: pixelX, y: pixelY }
          });

          r += pixel.r * kernelValue;
          g += pixel.g * kernelValue;
          b += pixel.b * kernelValue;
        }
      }
    }

    return {
      result: {
        r: ImageProcessor.clamp(Math.round(r), 0, 255),
        g: ImageProcessor.clamp(Math.round(g), 0, 255),
        b: ImageProcessor.clamp(Math.round(b), 0, 255)
      },
      steps,
      kernel: processedKernel
    };
  }
}
