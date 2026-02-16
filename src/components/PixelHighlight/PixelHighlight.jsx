import { useEffect, useRef } from 'react';

// Higher resolution overlay allows sub-pixel-width borders for crisp grid lines
const OVERLAY_SCALE = 8;

function PixelHighlight({ canvasRef, pixel, imageData, kernelSize = 3, mode, color = 'rgba(255, 0, 0, 1)', fillColor = null, rectangleSize, centered = false }) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !overlayRef.current || !imageData || !pixel) {
      if (overlayRef.current) {
        const ctx = overlayRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
      }
      return;
    }

    const overlay = overlayRef.current;
    const s = OVERLAY_SCALE;
    overlay.width = imageData.width * s;
    overlay.height = imageData.height * s;

    const ctx = overlay.getContext('2d');
    ctx.clearRect(0, 0, overlay.width, overlay.height);

    let { x, y } = pixel;

    // Center the rectangle on the pixel if centered mode is enabled
    if (centered && mode === 'rectangle' && rectangleSize) {
      x = x - Math.floor(rectangleSize.width / 2);
      y = y - Math.floor(rectangleSize.height / 2);
    }

    if (mode === 'single') {
      // 1-image-pixel thick border around the target pixel (same visual as before)
      ctx.fillStyle = color;
      ctx.fillRect((x - 1) * s, (y - 1) * s, 3 * s, s);   // Top
      ctx.fillRect((x - 1) * s, (y + 1) * s, 3 * s, s);   // Bottom
      ctx.fillRect((x - 1) * s, y * s, s, s);               // Left
      ctx.fillRect((x + 1) * s, y * s, s, s);               // Right
    } else if (mode === 'rectangle') {
      // Rectangle mode for template matching - draw border around rectangular region
      const { width: rw = 1, height: rh = 1 } = rectangleSize || {};

      // Use ctx.scale() like SelectionBox for consistency
      ctx.save();
      ctx.scale(s, s);

      // Semi-transparent fill
      if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fillRect(x, y, rw, rh);
      }

      // Border with same thickness as SelectionBox for visual consistency
      ctx.strokeStyle = color;
      ctx.lineWidth = 0.3;
      ctx.strokeRect(x + 0.15, y + 0.15, rw - 0.3, rh - 0.3);

      ctx.restore();
    } else {
      const offset = Math.floor(kernelSize / 2);

      // Fill individual cells if fillColor provided (animation mode)
      if (fillColor) {
        for (let ky = 0; ky < kernelSize; ky++) {
          for (let kx = 0; kx < kernelSize; kx++) {
            const px = x + kx - offset;
            const py = y + ky - offset;
            if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
              const isCenter = (kx === offset && ky === offset);
              ctx.fillStyle = isCenter
                ? fillColor.replace(/[\d.]+\)$/, '0.4)')
                : fillColor;
              ctx.fillRect(px * s, py * s, s, s);
            }
          }
        }
      }

      // Draw grid cell outlines using fillRect for pixel-perfect borders
      ctx.fillStyle = color;
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - offset;
          const py = y + ky - offset;
          if (px >= 0 && px < imageData.width && py >= 0 && py < imageData.height) {
            const sx = px * s;
            const sy = py * s;
            // 1-overlay-pixel border per cell edge (~1/8 of an image pixel)
            ctx.fillRect(sx, sy, s, 1);                // Top
            ctx.fillRect(sx, sy + s - 1, s, 1);        // Bottom
            ctx.fillRect(sx, sy + 1, 1, s - 2);        // Left
            ctx.fillRect(sx + s - 1, sy + 1, 1, s - 2); // Right
          }
        }
      }
    }
  }, [canvasRef, pixel, imageData, kernelSize, mode, color, fillColor, rectangleSize, centered]);

  return (
    <canvas
      ref={overlayRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

export default PixelHighlight;
