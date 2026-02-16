import { useRef, useLayoutEffect } from 'react';
import ComputationDisplay from './ComputationDisplay';

function FloatingComputationOverlay({ outputCanvasRef, wrapperRef, hoverState, kernelName, isGrayscale, inputImage, children }) {
  const overlayRef = useRef(null);

  // Position overlay directly via DOM in useLayoutEffect (runs before paint)
  // so the user never sees an incorrectly positioned frame.
  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay || !outputCanvasRef.current || !wrapperRef.current || !hoverState || !inputImage) return;

    const canvas = outputCanvasRef.current;
    const wrapper = wrapperRef.current;

    // Use getBoundingClientRect for accurate position relative to wrapper.
    // canvas.offsetTop was wrong because CardContent (position:relative) sits
    // between the canvas and the wrapper, making offsetTop relative to CardContent.
    const canvasRect = canvas.getBoundingClientRect();
    const wrapperRect = wrapper.getBoundingClientRect();
    const canvasTop = canvasRect.top - wrapperRect.top;
    const canvasLeft = canvasRect.left - wrapperRect.left;
    const canvasHeight = canvasRect.height;
    const canvasWidth = canvasRect.width;
    const wrapperWidth = wrapperRect.width;
    const wrapperHeight = wrapperRect.height;

    const { x: px, y: py } = hoverState.pixel;
    const { width: imgW, height: imgH } = inputImage;

    // Pixel center in DOM coords relative to wrapper
    const pixelCenterX = canvasLeft + ((px + 0.5) / imgW) * canvasWidth;

    // Highlight edges: mode="single" draws a 1px border around the target pixel,
    // extending from image row (py-1) to (py+2).
    const highlightTopEdge = canvasTop + ((py - 1) / imgH) * canvasHeight;
    const highlightBottomEdge = canvasTop + ((py + 2) / imgH) * canvasHeight;
    const gap = 8;

    // Above/below based on 50% of canvas height
    const pixelDomY = canvasTop + ((py + 0.5) / imgH) * canvasHeight;
    const canvasMidY = canvasTop + canvasHeight / 2;
    const isTopHalf = pixelDomY < canvasMidY;

    // Clamp horizontal position so overlay stays within wrapper bounds
    const overlayWidth = overlay.offsetWidth;
    const padding = 4;
    let left = pixelCenterX - overlayWidth / 2;
    left = Math.max(padding, Math.min(left, wrapperWidth - overlayWidth - padding));

    overlay.style.left = `${left}px`;
    overlay.style.transform = 'none';

    if (isTopHalf) {
      overlay.style.top = `${highlightBottomEdge + gap}px`;
      overlay.style.bottom = '';
    } else {
      overlay.style.top = '';
      overlay.style.bottom = `${wrapperHeight - highlightTopEdge + gap}px`;
    }
  });

  if (!hoverState) return null;

  return (
    <div ref={overlayRef} className="pointer-events-none absolute z-50">
      {children || (
        <ComputationDisplay
          hoverState={hoverState}
          kernelName={kernelName}
          isGrayscale={isGrayscale}
          compact
        />
      )}
    </div>
  );
}

export default FloatingComputationOverlay;
