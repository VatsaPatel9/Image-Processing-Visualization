import { useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Play, Pause } from 'lucide-react';
import PixelHighlight from '../PixelHighlight/PixelHighlight';
import PixelComputationDisplay from '../ComputationDisplay/PixelComputationDisplay';
import TemplateMatchingComputationDisplay from '../ComputationDisplay/TemplateMatchingComputationDisplay';
import FloatingComputationOverlay from '../ComputationDisplay/FloatingComputationOverlay';
import SelectionBox from '../SelectionBox/SelectionBox';
import { useCanvasHover } from '../../hooks/useCanvasHover';
import { useCanvasSelection } from '../../hooks/useCanvasSelection';

function ImageCanvas({
  inputImage,
  templateImage,
  outputImage,
  selectionBounds,
  onSelectionChange,
  enableAnimation,
  animationState,
  animationEnabled,
  onAnimationToggle,
  enableHover,
  subtopic,
  kernel,
  normalize,
  parameters,
  kernelName,
  selectedTopicId
}) {
  const inputCanvasRef = useRef(null);
  const templateCanvasRef = useRef(null);
  const outputCanvasRef = useRef(null);
  const outputWrapperRef = useRef(null);

  const isConvolution = selectedTopicId === 'convolution';
  const isPixelOp = selectedTopicId === 'pixel-processing';
  const isTemplateMatching = selectedTopicId === 'template-matching';

  // Draw input image
  useEffect(() => {
    if (inputImage && inputCanvasRef.current) {
      const canvas = inputCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = inputImage.width;
      canvas.height = inputImage.height;
      ctx.putImageData(inputImage, 0, 0);
    }
  }, [inputImage]);

  // Draw template image
  useEffect(() => {
    if (templateImage && templateCanvasRef.current) {
      const canvas = templateCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = templateImage.width;
      canvas.height = templateImage.height;
      ctx.putImageData(templateImage, 0, 0);
    }
  }, [templateImage]);

  // Draw output image (with animation support)
  useEffect(() => {
    const imageToRender = enableAnimation && animationState?.animatedOutput
      ? animationState.animatedOutput
      : outputImage;

    if (imageToRender && outputCanvasRef.current) {
      const canvas = outputCanvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = imageToRender.width;
      canvas.height = imageToRender.height;
      ctx.putImageData(imageToRender, 0, 0);
    }
  }, [outputImage, enableAnimation, animationState]);

  // Selection hook for template matching (must be declared first to get isDragging)
  const enableSelection = isTemplateMatching && !animationEnabled;

  const {
    selectionBounds: localSelectionBounds,
    isDragging,
    handleMouseDown,
    handleMouseMove: handleSelectionMove,
    handleMouseUp,
    clearSelection
  } = useCanvasSelection({
    enabled: enableSelection,
    inputImage
  });

  // Unified hover hook (works for both convolution and pixel operations)
  // Disable hover when dragging selection
  const { hoverState, handleMouseMove, clearHover } = useCanvasHover({
    enabled: enableHover && !isDragging,
    inputImage,
    subtopic,
    kernel,
    normalize,
    parameters,
    templateImage
  });

  // Sync local selection to parent
  useEffect(() => {
    if (localSelectionBounds !== selectionBounds) {
      onSelectionChange?.(localSelectionBounds);
    }
  }, [localSelectionBounds, selectionBounds, onSelectionChange]);

  const kernelSize = kernel ? kernel.length : 3;
  const isConvolutionHover = hoverState && hoverState.processorType === 'ConvolutionProcessor';
  const isPixelHover = hoverState && hoverState.processorType === 'PixelProcessor';

  const isOutputHover = hoverState && hoverState.source === 'output';
  const isAnimating = enableAnimation &&
    ((animationState?.computationPixel && animationState?.computation) ||
     (animationState?.computationPosition && animationState?.computation));

  // Convolution floating
  const showFloatingConvolution = isConvolution && (isOutputHover || isAnimating);

  // Pixel floating (hover on output OR animation)
  const isPixelAnimating = isPixelOp && isAnimating;
  const showFloatingPixel = (isPixelHover && isOutputHover) || isPixelAnimating;

  // Template matching floating
  const isTemplateAnimating = isTemplateMatching && isAnimating;
  const isTemplateHover = hoverState && hoverState.processorType === 'TemplateMatchingProcessor';
  const showFloatingTemplate = (isTemplateHover && isOutputHover) || isTemplateAnimating;

  // Build computation state from either hover or animation
  const computationState = useMemo(() => {
    if (hoverState) return hoverState;
    if (enableAnimation && animationState?.computation) {
      // Handle both pixel-based (convolution/pixel) and position-based (template matching)
      const pixel = animationState.computationPixel || animationState.computationPosition;
      return {
        pixel,
        computation: animationState.computation,
        inputPixel: animationState.computation.input,
        processorType: isConvolution ? 'ConvolutionProcessor'
          : isPixelOp ? 'PixelProcessor'
          : 'TemplateMatchingProcessor'
      };
    }
    return null;
  }, [hoverState, enableAnimation, animationState, isConvolution, isPixelOp]);

  // Detect grayscale from input image
  const isGrayscale = useMemo(() => {
    if (!inputImage) return true;
    const data = inputImage.data;
    for (let i = 0; i < Math.min(data.length, 400); i += 4) {
      if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) {
        return false;
      }
    }
    return true;
  }, [inputImage]);

  // Highlight mode: grid for convolution, single pixel for pixel ops
  const hoverHighlightMode = isConvolutionHover ? 'grid' : 'single';

  return (
    <div className="space-y-3">
      {/* Canvas grid: 2 canvases (normal) or 3 canvases (template matching) */}
      <div className={`grid gap-2 items-start ${
        isTemplateMatching ? 'grid-cols-[1fr_auto_1fr_auto_1fr]' : 'grid-cols-[1fr_auto_1fr]'
      }`}>
        {/* Input Canvas */}
        <Card className="overflow-hidden min-w-0">
          <CardHeader className="py-1.5 px-3 bg-muted/50">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Input Image{inputImage ? ` \u00b7 ${inputImage.width}\u00d7${inputImage.height}` : ''}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 relative">
            <canvas
              ref={inputCanvasRef}
              className="w-full aspect-square block"
              style={{
                imageRendering: 'pixelated',
                cursor: isTemplateMatching ? (isDragging ? 'crosshair' : 'cell') : 'default'
              }}
              onMouseDown={isTemplateMatching ? (e) => handleMouseDown(e, inputCanvasRef) : undefined}
              onMouseMove={(e) => {
                if (isTemplateMatching) {
                  handleSelectionMove(e, inputCanvasRef);
                } else {
                  handleMouseMove(e, inputCanvasRef, 'input');
                }
              }}
              onMouseUp={isTemplateMatching ? handleMouseUp : undefined}
              onMouseLeave={isTemplateMatching ? handleMouseUp : clearHover}
            />
            {!inputImage && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-muted/30">
                No image loaded
              </div>
            )}
            {/* Hover highlight on input (exclude template matching) */}
            {enableHover && hoverState && inputImage && !isTemplateHover && (
              <PixelHighlight
                canvasRef={inputCanvasRef}
                pixel={hoverState.pixel}
                imageData={inputImage}
                kernelSize={isConvolutionHover ? kernelSize : 1}
                mode={hoverHighlightMode}
                color="rgba(255, 0, 0, 1)"
              />
            )}
            {/* Animation highlight on input */}
            {enableAnimation && animationState?.currentPixel && inputImage && (
              <PixelHighlight
                canvasRef={inputCanvasRef}
                pixel={animationState.currentPixel}
                imageData={inputImage}
                kernelSize={isConvolution ? kernelSize : 1}
                mode={isConvolution ? 'grid' : 'single'}
                color="rgba(0, 102, 204, 0.6)"
                fillColor={isConvolution ? 'rgba(0, 102, 204, 0.15)' : null}
              />
            )}
            {/* Template animation - show bounds on INPUT */}
            {enableAnimation && isTemplateMatching && animationState?.currentPosition && templateImage && (
              <PixelHighlight
                canvasRef={inputCanvasRef}
                pixel={animationState.currentPosition}
                imageData={inputImage}
                mode="rectangle"
                rectangleSize={{ width: templateImage.width, height: templateImage.height }}
                color="rgba(0, 102, 204, 0.8)"
              />
            )}
            {/* Matched regions on INPUT - show all matched regions in green */}
            {isTemplateMatching && templateImage && animationState?.matchedRegions && animationState.matchedRegions.map((match, idx) => (
              <PixelHighlight
                key={idx}
                canvasRef={inputCanvasRef}
                pixel={{ x: match.x, y: match.y }}
                imageData={inputImage}
                mode="rectangle"
                rectangleSize={{ width: templateImage.width, height: templateImage.height }}
                color="rgba(34, 197, 94, 0.9)"
                fillColor="rgba(34, 197, 94, 0.15)"
              />
            ))}
            {/* Show template bounds on INPUT when hovering OUTPUT - same style as output */}
            {isTemplateMatching && templateImage && hoverState?.source === 'output' && !enableAnimation && (
              <PixelHighlight
                canvasRef={inputCanvasRef}
                pixel={hoverState.pixel}
                imageData={inputImage}
                mode="rectangle"
                rectangleSize={{ width: templateImage.width, height: templateImage.height }}
                color="rgba(255, 0, 0, 0.8)"
                centered={true}
              />
            )}
            {/* Selection overlay for template matching */}
            {isTemplateMatching && inputImage && (
              <SelectionBox
                canvasRef={inputCanvasRef}
                selectionBounds={selectionBounds}
                imageData={inputImage}
                isDragging={isDragging}
              />
            )}
            {/* Template matching instruction overlay - no layout shift */}
            {isTemplateMatching && !templateImage && (
              <div className="absolute bottom-0 left-0 right-0 mx-2 mb-2 pointer-events-none">
                <div className="text-xs text-amber-600 bg-amber-50/95 dark:bg-amber-900/95 border border-amber-200 dark:border-amber-800 rounded-md px-3 py-2 shadow-lg backdrop-blur-sm">
                  <strong>Select a region:</strong> Click and drag to select a template region.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tiny center arrow */}
        <div className="flex items-center pt-8 text-muted-foreground/50">
          <ArrowRight className="h-5 w-5" />
        </div>

        {/* Template Canvas (only for template matching) */}
        {isTemplateMatching && (
          <>
            <Card className="overflow-hidden min-w-0">
              <CardHeader className="py-1.5 px-3 bg-muted/50">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Template{templateImage ? ` · ${templateImage.width}×${templateImage.height}` : ''}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 relative">
                <canvas
                  ref={templateCanvasRef}
                  className="w-full aspect-square block"
                  style={{ imageRendering: 'pixelated' }}
                />
                {!templateImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-muted/30">
                    No template loaded
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Second arrow */}
            <div className="flex items-center pt-8 text-muted-foreground/50">
              <ArrowRight className="h-5 w-5" />
            </div>
          </>
        )}

        {/* Output Canvas */}
        <div className="relative min-w-0" ref={outputWrapperRef}>
          <Card className="overflow-hidden">
            <CardHeader className="py-1.5 px-3 bg-muted/50">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Output Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 relative">
              <canvas
                ref={outputCanvasRef}
                className="w-full aspect-square block"
                style={{ imageRendering: 'pixelated' }}
                onMouseMove={(e) => handleMouseMove(e, outputCanvasRef, 'output')}
                onMouseLeave={clearHover}
              />
              {!outputImage && (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-muted/30">
                  Processed image will appear here
                </div>
              )}
              {/* Hover highlight: single pixel or rectangle on output */}
              {enableHover && hoverState && inputImage && (
                <PixelHighlight
                  canvasRef={outputCanvasRef}
                  pixel={hoverState.pixel}
                  imageData={inputImage}
                  kernelSize={isConvolutionHover ? kernelSize : 1}
                  mode={isTemplateHover ? "rectangle" : "single"}
                  rectangleSize={isTemplateHover && templateImage ? { width: templateImage.width, height: templateImage.height } : undefined}
                  color="rgba(255, 0, 0, 0.8)"
                  fillColor={isTemplateHover ? "rgba(255, 0, 0, 0.1)" : undefined}
                  centered={isTemplateHover}
                />
              )}
              {/* Animation highlight: single pixel or rectangle on output */}
              {enableAnimation && (animationState?.currentPixel || animationState?.currentPosition) && inputImage && (
                <PixelHighlight
                  canvasRef={outputCanvasRef}
                  pixel={animationState.currentPixel || animationState.currentPosition}
                  imageData={inputImage}
                  kernelSize={isConvolution ? kernelSize : 1}
                  mode={isTemplateAnimating ? "rectangle" : "single"}
                  rectangleSize={isTemplateAnimating && templateImage ? { width: templateImage.width, height: templateImage.height } : undefined}
                  color="rgba(0, 102, 204, 0.8)"
                  fillColor={isTemplateAnimating ? "rgba(0, 102, 204, 0.1)" : undefined}
                  centered={isTemplateAnimating}
                />
              )}
              {/* Matched regions on OUTPUT - show all matched regions in green */}
              {isTemplateMatching && templateImage && animationState?.matchedRegions && animationState.matchedRegions.map((match, idx) => (
                <PixelHighlight
                  key={idx}
                  canvasRef={outputCanvasRef}
                  pixel={{ x: match.x, y: match.y }}
                  imageData={inputImage}
                  mode="rectangle"
                  rectangleSize={{ width: templateImage.width, height: templateImage.height }}
                  color="rgba(34, 197, 94, 0.9)"
                  fillColor="rgba(34, 197, 94, 0.15)"
                  centered={true}
                />
              ))}
            </CardContent>
          </Card>

          {/* Floating convolution computation overlay */}
          {showFloatingConvolution && (
            <FloatingComputationOverlay
              outputCanvasRef={outputCanvasRef}
              wrapperRef={outputWrapperRef}
              hoverState={computationState}
              kernelName={kernelName}
              isGrayscale={isGrayscale}
              inputImage={inputImage}
            />
          )}
          {/* Floating pixel computation overlay */}
          {showFloatingPixel && computationState && (
            <FloatingComputationOverlay
              outputCanvasRef={outputCanvasRef}
              wrapperRef={outputWrapperRef}
              hoverState={computationState}
              inputImage={inputImage}
            >
              <PixelComputationDisplay
                hoverState={computationState}
                operationName={kernelName}
                isGrayscale={isGrayscale}
                compact
              />
            </FloatingComputationOverlay>
          )}
          {/* Floating template matching computation overlay */}
          {showFloatingTemplate && computationState && (
            <FloatingComputationOverlay
              outputCanvasRef={outputCanvasRef}
              wrapperRef={outputWrapperRef}
              hoverState={computationState}
              inputImage={inputImage}
            >
              <TemplateMatchingComputationDisplay
                hoverState={computationState}
                templateImage={templateImage}
                operationName={kernelName}
                compact
              />
            </FloatingComputationOverlay>
          )}
        </div>
      </div>

      {/* Animation toolbar (both topics) */}
      <div className="flex items-center gap-3 px-1">
        <Button
          variant={animationEnabled ? "default" : "outline"}
          size="sm"
          className="gap-2"
          onClick={onAnimationToggle}
          disabled={isTemplateMatching && !templateImage}
          title={isTemplateMatching && !templateImage ? "Select a template region first" : ""}
        >
          {animationEnabled ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {animationEnabled ? 'Pause' : 'Animate'}
        </Button>
        {isTemplateMatching && !templateImage && (
          <span className="text-xs text-muted-foreground">Select a region in the input image first</span>
        )}
        {enableAnimation && animationState && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Speed</span>
              <Slider
                value={[animationState.speed]}
                onValueChange={(val) => animationState.setSpeed(val[0])}
                min={1}
                max={100}
                step={1}
                className="w-[120px]"
              />
              <span className="text-xs text-muted-foreground tabular-nums w-8">
                {animationState.speed}%
              </span>
            </div>
            <Progress value={animationState.progress} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground tabular-nums">
              {animationState.progress}%
            </span>
          </>
        )}
      </div>

    </div>
  );
}

export default ImageCanvas;
