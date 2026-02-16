import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for canvas selection (drag to select region)
 * Follows the same pattern as useCanvasHover
 */
export function useCanvasSelection({ enabled, inputImage }) {
  const dragStartRef = useRef(null);
  const [selectionBounds, setSelectionBounds] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Transform DOM coordinates to image pixel coordinates
   * Reuses pattern from useCanvasHover
   */
  const getPixelCoords = useCallback((e, canvasRef) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.floor((e.clientX - rect.left) * scaleX),
      y: Math.floor((e.clientY - rect.top) * scaleY)
    };
  }, []);

  const handleMouseDown = useCallback((e, canvasRef) => {
    if (!enabled || !inputImage || !canvasRef.current) return;

    const pixel = getPixelCoords(e, canvasRef);

    // Bounds check
    if (pixel.x < 0 || pixel.x >= inputImage.width ||
        pixel.y < 0 || pixel.y >= inputImage.height) {
      return;
    }

    dragStartRef.current = pixel;
    setIsDragging(true);
    setSelectionBounds(null);  // Clear previous selection while dragging
  }, [enabled, inputImage, getPixelCoords]);

  const handleMouseMove = useCallback((e, canvasRef) => {
    if (!isDragging || !dragStartRef.current || !inputImage || !canvasRef.current) {
      return;
    }

    const pixel = getPixelCoords(e, canvasRef);
    const start = dragStartRef.current;

    // Calculate bounds (normalize so width/height are always positive)
    const x = Math.min(start.x, pixel.x);
    const y = Math.min(start.y, pixel.y);
    const width = Math.abs(pixel.x - start.x) + 1;
    const height = Math.abs(pixel.y - start.y) + 1;

    // Clamp to image bounds
    const clampedX = Math.max(0, Math.min(x, inputImage.width - 1));
    const clampedY = Math.max(0, Math.min(y, inputImage.height - 1));
    const clampedWidth = Math.min(width, inputImage.width - clampedX);
    const clampedHeight = Math.min(height, inputImage.height - clampedY);

    setSelectionBounds({
      x: clampedX,
      y: clampedY,
      width: clampedWidth,
      height: clampedHeight
    });
  }, [isDragging, inputImage, getPixelCoords]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;

    setIsDragging(false);
    dragStartRef.current = null;

    // Minimum selection size validation (3×3 pixels)
    if (selectionBounds &&
        (selectionBounds.width < 3 || selectionBounds.height < 3)) {
      setSelectionBounds(null);
      console.warn('Selection too small (minimum 3×3 pixels)');
    }
    // selectionBounds persists after mouse up
  }, [isDragging, selectionBounds]);

  const clearSelection = useCallback(() => {
    setSelectionBounds(null);
    setIsDragging(false);
    dragStartRef.current = null;
  }, []);

  return {
    selectionBounds,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    clearSelection
  };
}
