import { useState, useEffect, useCallback } from 'react';
import { ConvolutionProcessor } from '../processors/ConvolutionProcessor';
import { PixelProcessor } from '../processors/PixelProcessor';
import { TemplateMatchingProcessor } from '../processors/TemplateMatchingProcessor';

/**
 * Custom hook for image processing
 */
export function useImageProcessor(inputImage, subtopic, parameters, kernel, normalize, templateImage) {
  const [outputImage, setOutputImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImage = useCallback(() => {
    if (!inputImage || !subtopic) {
      setOutputImage(null);
      return;
    }

    setIsProcessing(true);

    // Use setTimeout to prevent blocking the UI
    setTimeout(() => {
      try {
        let result;

        // Route to appropriate processor based on subtopic
        if (subtopic.processor === 'ConvolutionProcessor') {
          if (subtopic.method === 'applyKernel') {
            result = ConvolutionProcessor.applyKernel(
              inputImage,
              kernel || subtopic.defaultKernel,
              normalize
            );
          } else if (subtopic.method === 'applySobelCombined') {
            result = ConvolutionProcessor.applySobelCombined(inputImage);
          }
        } else if (subtopic.processor === 'PixelProcessor') {
          const method = subtopic.method;

          switch (method) {
            case 'toGrayscale':
              result = PixelProcessor.toGrayscale(
                inputImage,
                parameters.method || subtopic.parameters?.[0]?.value || 'luminosity'
              );
              break;
            case 'adjustBrightness':
              result = PixelProcessor.adjustBrightness(
                inputImage,
                parameters.amount ?? 0
              );
              break;
            case 'adjustContrast':
              result = PixelProcessor.adjustContrast(
                inputImage,
                parameters.factor ?? 1
              );
              break;
            case 'applyThreshold':
              result = PixelProcessor.applyThreshold(
                inputImage,
                parameters.threshold ?? 128
              );
              break;
            case 'invertColors':
              result = PixelProcessor.invertColors(inputImage);
              break;
            default:
              result = inputImage;
          }
        } else if (subtopic.processor === 'TemplateMatchingProcessor') {
          // Validate: template is required
          if (!templateImage) {
            console.warn('Template image required for template matching');
            result = null;
          } else if (templateImage.width > inputImage.width ||
                     templateImage.height > inputImage.height) {
            console.warn('Template must be smaller than source image');
            result = null;
          } else {
            const method = subtopic.method;

            switch (method) {
              case 'applyNCC':
                result = TemplateMatchingProcessor.applyNCC(inputImage, templateImage);
                break;
              case 'applySSD':
                result = TemplateMatchingProcessor.applySSD(inputImage, templateImage);
                break;
              case 'applySAD':
                result = TemplateMatchingProcessor.applySAD(inputImage, templateImage);
                break;
              default:
                result = inputImage;
            }
          }
        }

        setOutputImage(result);
      } catch (error) {
        console.error('Error processing image:', error);
        setOutputImage(null);
      } finally {
        setIsProcessing(false);
      }
    }, 0);
  }, [inputImage, subtopic, parameters, kernel, normalize, templateImage]);

  // Reprocess when dependencies change
  useEffect(() => {
    processImage();
  }, [processImage]);

  return { outputImage, isProcessing, processImage };
}
