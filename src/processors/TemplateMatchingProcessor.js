import { ImageProcessor } from '../core/ImageProcessor.js';

/**
 * TemplateMatchingProcessor - Handles template matching operations
 * Searches for a template image within a source image using various similarity metrics
 */
export class TemplateMatchingProcessor {
  /**
   * Apply Normalized Cross-Correlation (NCC) template matching
   * @param {ImageData} sourceData - Source image to search in
   * @param {ImageData} templateData - Template image to search for
   * @returns {ImageData} Heatmap showing match quality (bright = good match)
   */
  static applyNCC(sourceData, templateData) {
    // Validate inputs
    if (!sourceData || !templateData) {
      throw new Error('Source and template images are required');
    }

    const { width: srcW, height: srcH } = sourceData;
    const { width: tmpW, height: tmpH } = templateData;

    const validW = srcW - tmpW + 1;
    const validH = srcH - tmpH + 1;

    if (validW <= 0 || validH <= 0) {
      throw new Error('Template must be smaller than source image');
    }

    if (tmpW <= 0 || tmpH <= 0) {
      throw new Error('Template has invalid dimensions');
    }

    // Convert to grayscale arrays for processing
    const sourceGray = this.imageToGrayArray(sourceData);
    const templateGray = this.imageToGrayArray(templateData);

    // Compute template statistics once
    const templateMean = this.mean(templateGray);
    const templateStd = this.standardDeviation(templateGray, templateMean);

    // Collect all NCC scores
    const scoreMap = new Map();

    for (let y = 0; y < validH; y++) {
      for (let x = 0; x < validW; x++) {
        // Extract source patch
        const patch = this.extractGrayPatch(sourceGray, srcW, x, y, tmpW, tmpH);

        // Compute patch statistics
        const patchMean = this.mean(patch);
        const patchStd = this.standardDeviation(patch, patchMean);

        let ncc = 0;
        if (patchStd > 0 && templateStd > 0) {
          // Compute correlation
          let correlation = 0;
          for (let i = 0; i < patch.length; i++) {
            correlation += (patch[i] - patchMean) * (templateGray[i] - templateMean);
          }
          ncc = correlation / (patchStd * templateStd * patch.length);
        }

        scoreMap.set(y * srcW + x, ncc);
      }
    }

    // Create output image (same size as source)
    const output = ImageProcessor.createImageData(sourceData);

    // Fill output with heatmap
    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        let value = 0;

        if (x < validW && y < validH) {
          const ncc = scoreMap.get(y * srcW + x);
          // Map [-1, 1] to [0, 255]
          value = Math.round((ncc + 1) * 127.5);
          value = ImageProcessor.clamp(value, 0, 255);
        }

        ImageProcessor.setPixel(output, x, y, {
          r: value,
          g: value,
          b: value,
          a: 255
        });
      }
    }

    return output;
  }

  /**
   * Apply Sum of Squared Differences (SSD) template matching
   * @param {ImageData} sourceData - Source image to search in
   * @param {ImageData} templateData - Template image to search for
   * @returns {ImageData} Heatmap showing match quality (bright = good match)
   */
  static applySSD(sourceData, templateData) {
    // Validate inputs
    if (!sourceData || !templateData) {
      throw new Error('Source and template images are required');
    }

    const { width: srcW, height: srcH } = sourceData;
    const { width: tmpW, height: tmpH } = templateData;

    const validW = srcW - tmpW + 1;
    const validH = srcH - tmpH + 1;

    if (validW <= 0 || validH <= 0) {
      throw new Error('Template must be smaller than source image');
    }

    if (tmpW <= 0 || tmpH <= 0) {
      throw new Error('Template has invalid dimensions');
    }

    // Convert to grayscale
    const sourceGray = this.imageToGrayArray(sourceData);
    const templateGray = this.imageToGrayArray(templateData);

    const scoreMap = new Map();
    let minScore = Infinity;
    let maxScore = -Infinity;

    for (let y = 0; y < validH; y++) {
      for (let x = 0; x < validW; x++) {
        const patch = this.extractGrayPatch(sourceGray, srcW, x, y, tmpW, tmpH);

        // Compute SSD
        let ssd = 0;
        for (let i = 0; i < patch.length; i++) {
          const diff = patch[i] - templateGray[i];
          ssd += diff * diff;
        }

        scoreMap.set(y * srcW + x, ssd);
        minScore = Math.min(minScore, ssd);
        maxScore = Math.max(maxScore, ssd);
      }
    }

    // Create output
    const output = ImageProcessor.createImageData(sourceData);

    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        let value = 0;

        if (x < validW && y < validH) {
          const ssd = scoreMap.get(y * srcW + x);
          // Normalize to [0, 255]
          let normalized = 0;
          if (maxScore > minScore) {
            normalized = ((ssd - minScore) / (maxScore - minScore)) * 255;
          }
          // INVERT: low SSD (good match) → high value (bright)
          value = Math.round(255 - normalized);
          value = ImageProcessor.clamp(value, 0, 255);
        }

        ImageProcessor.setPixel(output, x, y, {
          r: value,
          g: value,
          b: value,
          a: 255
        });
      }
    }

    return output;
  }

  /**
   * Apply Sum of Absolute Differences (SAD) template matching
   * @param {ImageData} sourceData - Source image to search in
   * @param {ImageData} templateData - Template image to search for
   * @returns {ImageData} Heatmap showing match quality (bright = good match)
   */
  static applySAD(sourceData, templateData) {
    // Validate inputs
    if (!sourceData || !templateData) {
      throw new Error('Source and template images are required');
    }

    const { width: srcW, height: srcH } = sourceData;
    const { width: tmpW, height: tmpH } = templateData;

    const validW = srcW - tmpW + 1;
    const validH = srcH - tmpH + 1;

    if (validW <= 0 || validH <= 0) {
      throw new Error('Template must be smaller than source image');
    }

    if (tmpW <= 0 || tmpH <= 0) {
      throw new Error('Template has invalid dimensions');
    }

    // Convert to grayscale
    const sourceGray = this.imageToGrayArray(sourceData);
    const templateGray = this.imageToGrayArray(templateData);

    const scoreMap = new Map();
    let minScore = Infinity;
    let maxScore = -Infinity;

    for (let y = 0; y < validH; y++) {
      for (let x = 0; x < validW; x++) {
        const patch = this.extractGrayPatch(sourceGray, srcW, x, y, tmpW, tmpH);

        // Compute SAD
        let sad = 0;
        for (let i = 0; i < patch.length; i++) {
          sad += Math.abs(patch[i] - templateGray[i]);
        }

        scoreMap.set(y * srcW + x, sad);
        minScore = Math.min(minScore, sad);
        maxScore = Math.max(maxScore, sad);
      }
    }

    // Create output
    const output = ImageProcessor.createImageData(sourceData);

    for (let y = 0; y < srcH; y++) {
      for (let x = 0; x < srcW; x++) {
        let value = 0;

        if (x < validW && y < validH) {
          const sad = scoreMap.get(y * srcW + x);
          // Normalize to [0, 255]
          let normalized = 0;
          if (maxScore > minScore) {
            normalized = ((sad - minScore) / (maxScore - minScore)) * 255;
          }
          // INVERT: low SAD (good match) → high value (bright)
          value = Math.round(255 - normalized);
          value = ImageProcessor.clamp(value, 0, 255);
        }

        ImageProcessor.setPixel(output, x, y, {
          r: value,
          g: value,
          b: value,
          a: 255
        });
      }
    }

    return output;
  }

  /**
   * Calculate match score at a specific pixel position (for hover visualization)
   * @param {ImageData} sourceData - Source image
   * @param {ImageData} templateData - Template image
   * @param {string} method - 'ncc', 'ssd', or 'sad'
   * @param {number} x - X coordinate where template is positioned
   * @param {number} y - Y coordinate where template is positioned
   * @returns {object} Detailed calculation steps for educational display
   */
  static calculateAtPixel(sourceData, templateData, method, x, y) {
    const { width: tmpW, height: tmpH } = templateData;
    const { width: srcW, height: srcH } = sourceData;

    // Check if position is valid
    if (x < 0 || y < 0 || x + tmpW > srcW || y + tmpH > srcH) {
      return {
        score: 0,
        normalizedScore: 0,
        steps: [],
        formula: 'Invalid position (template out of bounds)',
        templateBounds: { x, y, width: tmpW, height: tmpH }
      };
    }

    const sourceGray = this.imageToGrayArray(sourceData);
    const templateGray = this.imageToGrayArray(templateData);
    const patch = this.extractGrayPatch(sourceGray, srcW, x, y, tmpW, tmpH);

    // Build steps array for visualization
    const steps = [];
    for (let py = 0; py < tmpH; py++) {
      for (let px = 0; px < tmpW; px++) {
        const idx = py * tmpW + px;
        steps.push({
          sourceValue: patch[idx],
          templateValue: templateGray[idx],
          position: { x: x + px, y: y + py }
        });
      }
    }

    let score, normalizedScore, formula;

    if (method === 'ncc') {
      const patchMean = this.mean(patch);
      const templateMean = this.mean(templateGray);
      const patchStd = this.standardDeviation(patch, patchMean);
      const templateStd = this.standardDeviation(templateGray, templateMean);

      if (patchStd === 0 || templateStd === 0) {
        score = 0;
      } else {
        let correlation = 0;
        for (let i = 0; i < patch.length; i++) {
          correlation += (patch[i] - patchMean) * (templateGray[i] - templateMean);
        }
        score = correlation / (patchStd * templateStd * patch.length);
      }

      normalizedScore = Math.round((score + 1) * 127.5);
      formula = `NCC = Σ[(src - μ_src)(tmpl - μ_tmpl)] / (σ_src × σ_tmpl × n)\n` +
                `μ_src=${patchMean.toFixed(2)}, σ_src=${patchStd.toFixed(2)}\n` +
                `μ_tmpl=${templateMean.toFixed(2)}, σ_tmpl=${templateStd.toFixed(2)}\n` +
                `NCC = ${score.toFixed(4)}`;

    } else if (method === 'ssd') {
      score = 0;
      for (let i = 0; i < patch.length; i++) {
        const diff = patch[i] - templateGray[i];
        score += diff * diff;
      }

      // For single pixel, we don't have global min/max context
      normalizedScore = Math.min(255, Math.round(score / 100));
      formula = `SSD = Σ(src_i - tmpl_i)² = ${score.toFixed(2)}`;

    } else if (method === 'sad') {
      score = 0;
      for (let i = 0; i < patch.length; i++) {
        score += Math.abs(patch[i] - templateGray[i]);
      }

      normalizedScore = Math.min(255, Math.round(score / 10));
      formula = `SAD = Σ|src_i - tmpl_i| = ${score.toFixed(2)}`;
    }

    return {
      score,
      normalizedScore,
      steps,
      formula,
      templateBounds: { x, y, width: tmpW, height: tmpH }
    };
  }

  /**
   * Convert ImageData to grayscale Float32Array
   * @param {ImageData} imageData - Image data
   * @returns {Float32Array} Grayscale values
   */
  static imageToGrayArray(imageData) {
    const { width, height, data } = imageData;
    const gray = new Float32Array(width * height);

    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];
      // Luminosity method
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    return gray;
  }

  /**
   * Extract a patch from grayscale array
   * @param {Float32Array} grayArray - Grayscale array
   * @param {number} srcWidth - Source image width
   * @param {number} x - Top-left X coordinate
   * @param {number} y - Top-left Y coordinate
   * @param {number} patchW - Patch width
   * @param {number} patchH - Patch height
   * @returns {Float32Array} Extracted patch
   */
  static extractGrayPatch(grayArray, srcWidth, x, y, patchW, patchH) {
    const patch = new Float32Array(patchW * patchH);

    for (let py = 0; py < patchH; py++) {
      for (let px = 0; px < patchW; px++) {
        const srcIdx = (y + py) * srcWidth + (x + px);
        const patchIdx = py * patchW + px;
        patch[patchIdx] = grayArray[srcIdx];
      }
    }

    return patch;
  }

  /**
   * Compute mean of array
   * @param {Float32Array|Array} values - Array of values
   * @returns {number} Mean value
   */
  static mean(values) {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      sum += values[i];
    }
    return sum / values.length;
  }

  /**
   * Compute standard deviation
   * @param {Float32Array|Array} values - Array of values
   * @param {number} mean - Mean value
   * @returns {number} Standard deviation
   */
  static standardDeviation(values, mean) {
    let variance = 0;
    for (let i = 0; i < values.length; i++) {
      const diff = values[i] - mean;
      variance += diff * diff;
    }
    variance /= values.length;
    return Math.sqrt(variance);
  }
}
