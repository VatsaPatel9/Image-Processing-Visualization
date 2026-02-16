import { useState, useEffect, useRef, useCallback } from 'react';
import { ConvolutionProcessor } from '../processors/ConvolutionProcessor';
import { ImageProcessor } from '../core/ImageProcessor';

export function useConvolutionAnimation(inputImage, kernel, normalize) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // 1-100 scale
  const [currentPixel, setCurrentPixel] = useState({ x: 0, y: 0 });
  const [animatedOutput, setAnimatedOutput] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [computation, setComputation] = useState(null);
  const [computationPixel, setComputationPixel] = useState(null);

  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  // Initialize animated output when input image changes
  useEffect(() => {
    if (inputImage && kernel) {
      // Create a copy of input image to start
      const output = ImageProcessor.createImageData(inputImage);
      // Copy input pixels to output initially
      for (let i = 0; i < inputImage.data.length; i++) {
        output.data[i] = inputImage.data[i];
      }
      setAnimatedOutput(output);
      setCurrentPixel({ x: 0, y: 0 });
      setIsComplete(false);
      setProgress(0);
      setIsPlaying(true);
    }
  }, [inputImage, kernel]);

  const reset = useCallback(() => {
    if (inputImage && kernel) {
      const output = ImageProcessor.createImageData(inputImage);
      for (let i = 0; i < inputImage.data.length; i++) {
        output.data[i] = inputImage.data[i];
      }
      setAnimatedOutput(output);
      setCurrentPixel({ x: 0, y: 0 });
      setIsComplete(false);
      setProgress(0);
      setIsPlaying(false);
      lastUpdateTimeRef.current = 0;
    }
  }, [inputImage, kernel]);

  // Reset animation when kernel or normalize changes mid-animation
  // (intentionally limited deps — inputImage/isPlaying changes are handled by init effect)
  useEffect(() => {
    if (inputImage && kernel && isPlaying) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kernel, normalize]);

  const processNextPixel = useCallback(() => {
    if (!inputImage || !kernel || !animatedOutput || isComplete) return false;

    const { width, height } = inputImage;
    const { x, y } = currentPixel;

    // Process current pixel
    const result = ConvolutionProcessor.calculateAtPixel(
      inputImage,
      kernel,
      x,
      y,
      normalize
    );

    // Store computation for display (pixel coords must stay paired with computation)
    setComputationPixel({ x, y });
    setComputation(result);

    // Update the pixel in animated output
    ImageProcessor.setPixel(animatedOutput, x, y, {
      r: result.result.r,
      g: result.result.g,
      b: result.result.b,
      a: 255
    });

    // Advance to next pixel (raster scan order: left-to-right, top-to-bottom)
    let nextX = x + 1;
    let nextY = y;

    if (nextX >= width) {
      nextX = 0;
      nextY = y + 1;
    }

    // Check if we've completed the animation
    if (nextY >= height) {
      setIsComplete(true);
      setIsPlaying(false);
      setProgress(100);
      return false;
    }

    // Update current pixel and progress
    setCurrentPixel({ x: nextX, y: nextY });
    const totalPixels = width * height;
    const currentPixelIndex = nextY * width + nextX;
    setProgress(Math.floor((currentPixelIndex / totalPixels) * 100));

    // Trigger a re-render by creating a new ImageData reference
    setAnimatedOutput(new ImageData(
      new Uint8ClampedArray(animatedOutput.data),
      animatedOutput.width,
      animatedOutput.height
    ));

    return true;
  }, [inputImage, kernel, normalize, animatedOutput, currentPixel, isComplete]);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !inputImage || !kernel) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp) => {
      // Calculate delay based on speed: speed 1 = 450ms delay, speed 100 = 0ms delay
      const delay = 450 - (speed - 1) * 4.5;

      if (timestamp - lastUpdateTimeRef.current >= delay) {
        const shouldContinue = processNextPixel();
        lastUpdateTimeRef.current = timestamp;

        if (!shouldContinue) {
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed, processNextPixel, inputImage, kernel]);

  const play = useCallback(() => {
    if (isComplete) {
      reset();
    }
    setIsPlaying(true);
  }, [isComplete, reset]);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return {
    isPlaying,
    speed,
    currentPixel,
    animatedOutput,
    isComplete,
    progress,
    computation,
    computationPixel,
    play,
    pause,
    reset,
    setSpeed,
    togglePlayPause
  };
}
