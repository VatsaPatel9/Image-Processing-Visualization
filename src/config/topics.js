export const topics = [
  {
    id: 'convolution',
    title: 'Convolution & Kernels',
    description: 'Understand how kernels transform images through convolution',
    icon: '🔲',
    topicExplanation: `Convolution is a fundamental image processing technique that transforms each pixel based on its neighbors. A small matrix called a kernel (or filter) slides across the image — at each position, the overlapping pixel values are multiplied by the kernel weights and summed to produce the output pixel. Different kernels produce different effects: blurring averages neighbors to smooth noise, sharpening amplifies edges, and edge-detection kernels (like Sobel) highlight boundaries between regions.`,
    subtopics: [
      {
        id: 'identity',
        title: 'Identity Kernel',
        description: 'No transformation - output equals input',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0]
        ],
        normalize: false,
        explanation: `The identity kernel leaves the image unchanged. The center value is 1,
                     and all other values are 0, so each pixel is multiplied by 1 and others by 0.`,
        formula: 'output(x,y) = input(x,y)',
        allowCustomKernel: true
      },
      {
        id: 'box-blur',
        title: 'Box Blur',
        description: 'Simple averaging filter for smoothing',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 1, 1]
        ],
        normalize: true,
        explanation: `Box blur replaces each pixel with the average of its 3×3 neighborhood.
                     This smooths the image by reducing high-frequency details and noise.`,
        formula: 'output(x,y) = (1/9) × Σ input(x+i, y+j) for i,j ∈ {-1,0,1}',
        allowCustomKernel: true
      },
      {
        id: 'gaussian-blur',
        title: 'Gaussian Blur',
        description: 'Weighted averaging with Gaussian distribution',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [1, 2, 1],
          [2, 4, 2],
          [1, 2, 1]
        ],
        normalize: true,
        explanation: `Gaussian blur uses weights based on a Gaussian distribution. Center pixels
                     have more influence than edge pixels, producing a smoother blur than box blur.`,
        formula: 'G(x,y) = (1/2πσ²) × e^(-(x²+y²)/2σ²)',
        allowCustomKernel: true
      },
      {
        id: 'sharpen',
        title: 'Sharpen',
        description: 'Enhance edges and details',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [0, -1, 0],
          [-1, 5, -1],
          [0, -1, 0]
        ],
        normalize: false,
        explanation: `Sharpening enhances edges by emphasizing differences between neighboring pixels.
                     The center value > 1 and negative surrounding values create the sharpening effect.`,
        formula: 'output = input + (input - blur(input))',
        allowCustomKernel: true
      },
      {
        id: 'sobel-horizontal',
        title: 'Sobel Horizontal',
        description: 'Detect vertical edges (horizontal gradient)',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1]
        ],
        normalize: false,
        explanation: `Sobel horizontal detects vertical edges by computing the horizontal gradient.
                     Positive values on the right, negative on the left create edge detection.`,
        formula: 'Gx = [[-1,0,1],[-2,0,2],[-1,0,1]] * image',
        allowCustomKernel: true
      },
      {
        id: 'sobel-vertical',
        title: 'Sobel Vertical',
        description: 'Detect horizontal edges (vertical gradient)',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [-1, -2, -1],
          [0, 0, 0],
          [1, 2, 1]
        ],
        normalize: false,
        explanation: `Sobel vertical detects horizontal edges by computing the vertical gradient.
                     Positive values at the bottom, negative at the top create edge detection.`,
        formula: 'Gy = [[-1,-2,-1],[0,0,0],[1,2,1]] * image',
        allowCustomKernel: true
      },
      {
        id: 'sobel-combined',
        title: 'Sobel Combined',
        description: 'Detect all edges (gradient magnitude)',
        processor: 'ConvolutionProcessor',
        method: 'applySobelCombined',
        defaultKernel: null, // Uses both horizontal and vertical
        normalize: false,
        explanation: `Sobel combined applies both horizontal and vertical Sobel filters and combines
                     them using: magnitude = √(Gx² + Gy²). This detects edges in all directions.`,
        formula: '|G| = √(Gx² + Gy²)',
        allowCustomKernel: false
      },
      {
        id: 'emboss',
        title: 'Emboss',
        description: 'Create 3D embossed effect',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [-2, -1, 0],
          [-1, 1, 1],
          [0, 1, 2]
        ],
        normalize: false,
        explanation: `Emboss creates a 3D raised effect by computing directional gradients.
                     The kernel is designed to highlight edges along a diagonal.`,
        formula: 'Emboss creates relief by directional gradient',
        allowCustomKernel: true
      },
      {
        id: 'custom',
        title: 'Custom Kernel',
        description: 'Create your own kernel',
        processor: 'ConvolutionProcessor',
        method: 'applyKernel',
        defaultKernel: [
          [0, 0, 0],
          [0, 1, 0],
          [0, 0, 0]
        ],
        normalize: false,
        explanation: `Create your own custom 3×3 kernel to experiment with different effects.
                     Try different combinations and see how they transform the image.`,
        formula: 'User-defined convolution',
        allowCustomKernel: true
      }
    ]
  },
  {
    id: 'pixel-processing',
    title: 'Pixel Processing',
    description: 'Direct pixel-level operations',
    icon: '🎨',
    topicExplanation: `Pixel processing applies a mathematical formula to each pixel independently — no neighbors are involved. These point operations can convert color images to grayscale, adjust brightness and contrast, threshold an image into black and white, or invert colors. Because each pixel is processed in isolation, pixel operations are fast and easy to reason about.`,
    subtopics: [
      {
        id: 'grayscale-luminosity',
        title: 'Grayscale (Luminosity)',
        description: 'Convert to grayscale using luminosity method',
        processor: 'PixelProcessor',
        method: 'toGrayscale',
        parameters: [
          {
            name: 'method',
            type: 'fixed',
            value: 'luminosity'
          }
        ],
        explanation: `The luminosity method weights RGB channels according to human perception.
                     Green contributes most to brightness, red moderate, and blue least.`,
        formula: 'gray = 0.299R + 0.587G + 0.114B',
        allowCustomKernel: false
      },
      {
        id: 'grayscale-average',
        title: 'Grayscale (Average)',
        description: 'Convert to grayscale using average method',
        processor: 'PixelProcessor',
        method: 'toGrayscale',
        parameters: [
          {
            name: 'method',
            type: 'fixed',
            value: 'average'
          }
        ],
        explanation: `The average method simply averages the three RGB channels equally.
                     This is simpler but less perceptually accurate than luminosity.`,
        formula: 'gray = (R + G + B) / 3',
        allowCustomKernel: false
      },
      {
        id: 'brightness',
        title: 'Brightness Adjustment',
        description: 'Increase or decrease brightness',
        processor: 'PixelProcessor',
        method: 'adjustBrightness',
        parameters: [
          {
            name: 'amount',
            type: 'slider',
            min: -100,
            max: 100,
            default: 0,
            step: 1,
            unit: ''
          }
        ],
        explanation: `Brightness adjustment adds a constant value to all RGB channels.
                     Positive values make the image brighter, negative values darker.`,
        formula: 'output = clamp(input + amount, 0, 255)',
        allowCustomKernel: false
      },
      {
        id: 'contrast',
        title: 'Contrast Adjustment',
        description: 'Increase or decrease contrast',
        processor: 'PixelProcessor',
        method: 'adjustContrast',
        parameters: [
          {
            name: 'factor',
            type: 'slider',
            min: 0,
            max: 3,
            default: 1,
            step: 0.1,
            unit: 'x'
          }
        ],
        explanation: `Contrast adjustment multiplies pixel values by a factor.
                     Values > 1 increase contrast, values < 1 decrease it. Based around middle gray (128).`,
        formula: 'output = clamp((input - 128) × factor + 128, 0, 255)',
        allowCustomKernel: false
      },
      {
        id: 'threshold',
        title: 'Binary Threshold',
        description: 'Convert to binary black/white image',
        processor: 'PixelProcessor',
        method: 'applyThreshold',
        parameters: [
          {
            name: 'threshold',
            type: 'slider',
            min: 0,
            max: 255,
            default: 128,
            step: 1,
            unit: ''
          }
        ],
        explanation: `Binary thresholding converts an image to pure black and white.
                     Pixels brighter than the threshold become white, others become black.`,
        formula: 'output = (input > threshold) ? 255 : 0',
        allowCustomKernel: false
      },
      {
        id: 'invert',
        title: 'Invert Colors',
        description: 'Create a negative of the image',
        processor: 'PixelProcessor',
        method: 'invertColors',
        parameters: [],
        explanation: `Color inversion creates a negative by subtracting each pixel value from 255.
                     Black becomes white, white becomes black, and colors become complementary.`,
        formula: 'output = 255 - input',
        allowCustomKernel: false
      }
    ]
  },
  {
    id: 'template-matching',
    title: 'Template Matching',
    description: 'Find patterns in images using correlation',
    icon: '🔍',
    topicExplanation: `Template matching searches for a small template image within a larger source image by computing similarity scores at every position. The algorithm slides the template across the source image, comparing the template to each overlapping region. Different matching methods use different similarity metrics: NCC (Normalized Cross-Correlation) measures correlation and is robust to brightness changes, SSD (Sum of Squared Differences) measures pixel-wise squared differences, and SAD (Sum of Absolute Differences) is a faster approximation using absolute differences. The output is a heatmap showing match quality at each position, where brighter pixels indicate better matches.`,
    subtopics: [
      {
        id: 'ncc',
        title: 'Normalized Cross-Correlation (NCC)',
        description: 'Correlation-based matching, robust to brightness',
        processor: 'TemplateMatchingProcessor',
        method: 'applyNCC',
        requiresTemplate: true,
        defaultKernel: null,
        normalize: false,
        parameters: [],
        explanation: `NCC computes the correlation coefficient between the template and each source region by normalizing both patches (zero mean, unit variance). This makes it invariant to linear brightness and contrast changes. The correlation coefficient ranges from -1 (anti-correlated) to +1 (perfectly correlated), where values near +1 indicate strong matches. For visualization, NCC scores are mapped to [0, 255] where brighter pixels represent better matches.`,
        formula: 'NCC(x,y) = Σ[(src - μ_src)(tmpl - μ_tmpl)] / (σ_src × σ_tmpl × n)',
        allowCustomKernel: false
      },
      {
        id: 'ssd',
        title: 'Sum of Squared Differences (SSD)',
        description: 'Squared pixel differences, simple and effective',
        processor: 'TemplateMatchingProcessor',
        method: 'applySSD',
        requiresTemplate: true,
        defaultKernel: null,
        normalize: false,
        parameters: [],
        explanation: `SSD computes the sum of squared differences between corresponding pixels in the template and source region. Lower SSD values indicate better matches (smaller differences). Unlike NCC, SSD is sensitive to brightness and contrast changes but is computationally simpler. For visualization, SSD scores are normalized and inverted so that brighter pixels represent better matches (lower SSD values).`,
        formula: 'SSD(x,y) = Σ(src_i - tmpl_i)²',
        allowCustomKernel: false
      },
      {
        id: 'sad',
        title: 'Sum of Absolute Differences (SAD)',
        description: 'Absolute pixel differences, fast approximation',
        processor: 'TemplateMatchingProcessor',
        method: 'applySAD',
        requiresTemplate: true,
        defaultKernel: null,
        normalize: false,
        parameters: [],
        explanation: `SAD computes the sum of absolute differences between pixels, making it faster than SSD (no squaring operation) while producing similar results. Like SSD, lower values mean better matches, and it's sensitive to brightness changes. This method is commonly used in real-time applications like video compression and motion estimation due to its computational efficiency. For visualization, SAD scores are normalized and inverted to show brighter pixels as better matches.`,
        formula: 'SAD(x,y) = Σ|src_i - tmpl_i|',
        allowCustomKernel: false
      }
    ]
  }
];
