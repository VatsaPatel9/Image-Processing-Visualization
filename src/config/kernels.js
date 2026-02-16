// Predefined kernels for quick access
export const predefinedKernels = {
  identity: {
    name: 'Identity',
    kernel: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ],
    normalize: false
  },
  boxBlur: {
    name: 'Box Blur',
    kernel: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1]
    ],
    normalize: true
  },
  gaussianBlur: {
    name: 'Gaussian Blur',
    kernel: [
      [1, 2, 1],
      [2, 4, 2],
      [1, 2, 1]
    ],
    normalize: true
  },
  sharpen: {
    name: 'Sharpen',
    kernel: [
      [0, -1, 0],
      [-1, 5, -1],
      [0, -1, 0]
    ],
    normalize: false
  },
  edgeDetect: {
    name: 'Edge Detect',
    kernel: [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1]
    ],
    normalize: false
  },
  sobelHorizontal: {
    name: 'Sobel Horizontal',
    kernel: [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ],
    normalize: false
  },
  sobelVertical: {
    name: 'Sobel Vertical',
    kernel: [
      [-1, -2, -1],
      [0, 0, 0],
      [1, 2, 1]
    ],
    normalize: false
  },
  emboss: {
    name: 'Emboss',
    kernel: [
      [-2, -1, 0],
      [-1, 1, 1],
      [0, 1, 2]
    ],
    normalize: false
  },
};

// Helper function to create an empty NxN kernel
export function createEmptyKernel(size = 3) {
  return Array(size).fill(0).map(() => Array(size).fill(0));
}

// Helper function to create identity kernel of any size
export function createIdentityKernel(size) {
  const kernel = createEmptyKernel(size);
  const center = Math.floor(size / 2);
  kernel[center][center] = 1;
  return kernel;
}

// Helper function to create box blur kernel of any size
export function createBoxBlurKernel(size) {
  return Array(size).fill(1).map(() => Array(size).fill(1));
}

// Helper function to create Gaussian blur kernel of any size
export function createGaussianKernel(size) {
  const kernel = [];
  const sigma = size / 3;
  const center = Math.floor(size / 2);

  for (let i = 0; i < size; i++) {
    kernel[i] = [];
    for (let j = 0; j < size; j++) {
      const x = i - center;
      const y = j - center;
      kernel[i][j] = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
    }
  }

  return kernel;
}

// Helper to check if a preset is available for a given size
export function isPresetAvailableForSize(presetKey, size) {
  // These presets can be generated for any size
  const scalablePresets = ['identity', 'boxBlur', 'gaussianBlur'];

  // Other presets only work with 3x3
  if (scalablePresets.includes(presetKey)) {
    return true;
  }

  return size === 3;
}

// Get a preset kernel for a specific size
export function getPresetForSize(presetKey, size) {
  if (size === 3) {
    return predefinedKernels[presetKey];
  }

  // Generate scaled versions for supported presets
  switch (presetKey) {
    case 'identity':
      return {
        name: 'Identity',
        kernel: createIdentityKernel(size),
        normalize: false
      };
    case 'boxBlur':
      return {
        name: 'Box Blur',
        kernel: createBoxBlurKernel(size),
        normalize: true
      };
    case 'gaussianBlur':
      return {
        name: 'Gaussian Blur',
        kernel: createGaussianKernel(size),
        normalize: true
      };
    default:
      return null;
  }
}
