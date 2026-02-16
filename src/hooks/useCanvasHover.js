import { useState, useCallback, useRef } from 'react';
import { ConvolutionProcessor } from '../processors/ConvolutionProcessor';
import { PixelProcessor } from '../processors/PixelProcessor';
import { TemplateMatchingProcessor } from '../processors/TemplateMatchingProcessor';
import { ImageProcessor } from '../core/ImageProcessor';

export function useCanvasHover({ enabled, inputImage, subtopic, kernel, normalize, parameters, templateImage }) {
  const lastHoverTimeRef = useRef(0);
  const [hoverState, setHoverState] = useState(null);

  const handleMouseMove = useCallback((e, canvasRef, source) => {
    if (!enabled || !inputImage || !subtopic || !canvasRef.current) return;

    // For convolution ops, kernel is required
    if (subtopic.processor === 'ConvolutionProcessor' && !kernel) return;

    const now = Date.now();
    if (now - lastHoverTimeRef.current < 50) return;
    lastHoverTimeRef.current = now;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const pixelX = Math.floor((e.clientX - rect.left) * scaleX);
    const pixelY = Math.floor((e.clientY - rect.top) * scaleY);

    if (pixelX < 0 || pixelX >= inputImage.width ||
        pixelY < 0 || pixelY >= inputImage.height) {
      return;
    }

    const inputPixel = ImageProcessor.getPixel(inputImage, pixelX, pixelY);
    let computation;

    if (subtopic.processor === 'ConvolutionProcessor') {
      computation = ConvolutionProcessor.calculateAtPixel(
        inputImage, kernel, pixelX, pixelY, normalize
      );
    } else if (subtopic.processor === 'PixelProcessor') {
      computation = PixelProcessor.calculateAtPixel(
        inputImage, subtopic.method, parameters || {}, pixelX, pixelY
      );
    } else if (subtopic.processor === 'TemplateMatchingProcessor') {
      if (!templateImage) return;

      computation = TemplateMatchingProcessor.calculateAtPixel(
        inputImage,
        templateImage,
        subtopic.id,  // 'ncc', 'ssd', or 'sad'
        pixelX,
        pixelY
      );
    }

    setHoverState({
      pixel: { x: pixelX, y: pixelY },
      source,
      computation,
      inputPixel,
      processorType: subtopic.processor
    });
  }, [enabled, inputImage, subtopic, kernel, normalize, parameters, templateImage]);

  const clearHover = useCallback(() => {
    setHoverState(null);
  }, []);

  return { hoverState, handleMouseMove, clearHover };
}
