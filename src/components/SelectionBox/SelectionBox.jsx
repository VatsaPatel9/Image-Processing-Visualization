import { useEffect, useRef } from 'react';

const OVERLAY_SCALE = 8;  // Match PixelHighlight DPI scaling

/**
 * SelectionBox - Visual overlay showing selection rectangle
 * Follows the same pattern as PixelHighlight
 */
function SelectionBox({ canvasRef, selectionBounds, imageData, isDragging }) {
  const overlayCanvasRef = useRef(null);

  useEffect(() => {
    if (!selectionBounds || !imageData || !canvasRef.current || !overlayCanvasRef.current) {
      return;
    }

    const canvas = overlayCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = imageData;

    // High DPI rendering
    canvas.width = width * OVERLAY_SCALE;
    canvas.height = height * OVERLAY_SCALE;
    ctx.scale(OVERLAY_SCALE, OVERLAY_SCALE);

    ctx.clearRect(0, 0, width, height);

    const { x, y, width: w, height: h } = selectionBounds;

    // Draw semi-transparent fill
    ctx.fillStyle = isDragging
      ? 'rgba(59, 130, 246, 0.15)'  // Blue while dragging
      : 'rgba(34, 197, 94, 0.15)';  // Green when confirmed
    ctx.fillRect(x, y, w, h);

    // Draw border (thicker for visibility)
    ctx.strokeStyle = isDragging
      ? 'rgba(59, 130, 246, 0.8)'   // Blue border
      : 'rgba(34, 197, 94, 1)';     // Green border
    ctx.lineWidth = 0.3;
    ctx.strokeRect(x + 0.15, y + 0.15, w - 0.3, h - 0.3);

    // Draw corner handles (when not dragging)
    if (!isDragging) {
      const handleSize = 0.6;
      ctx.fillStyle = 'rgba(34, 197, 94, 1)';

      // Top-left, top-right, bottom-left, bottom-right
      [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([hx, hy]) => {
        ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
      });
    }

  }, [selectionBounds, imageData, isDragging]);

  if (!selectionBounds || !imageData) return null;

  return (
    <canvas
      ref={overlayCanvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        imageRendering: 'pixelated',
        zIndex: 20  // Above PixelHighlight
      }}
    />
  );
}

export default SelectionBox;
