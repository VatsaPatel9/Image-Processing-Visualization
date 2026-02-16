import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { TemplateMatchingProcessor } from '../processors/TemplateMatchingProcessor';
import { ImageProcessor } from '../core/ImageProcessor';

export function useTemplateMatchingAnimation(inputImage, templateImage, method) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(50); // 1-100 scale
  const [currentPosition, setCurrentPosition] = useState({ x: 0, y: 0 });
  const [animatedOutput, setAnimatedOutput] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [computation, setComputation] = useState(null);
  const [computationPosition, setComputationPosition] = useState(null);
  const [allScores, setAllScores] = useState([]); // Store all positions and scores
  const [matchThreshold, setMatchThreshold] = useState(200); // 0-255, default ~78% match quality
  const [limitMatches, setLimitMatches] = useState(true); // Whether to limit to top N matches
  const [maxMatches, setMaxMatches] = useState(5); // Number of top matches to show when limited

  const animationFrameRef = useRef(null);
  const lastUpdateTimeRef = useRef(0);

  // Initialize animated output when input image or template changes
  useEffect(() => {
    if (inputImage && templateImage) {
      // Validate template size
      const validW = inputImage.width - templateImage.width + 1;
      const validH = inputImage.height - templateImage.height + 1;

      if (validW <= 0 || validH <= 0) {
        console.warn('Template must be smaller than source image');
        setAnimatedOutput(null);
        return;
      }

      // Create output canvas (same size as input) initialized to black
      const output = ImageProcessor.createImageData(inputImage);
      // Fill with black (0, 0, 0)
      for (let i = 0; i < output.data.length; i += 4) {
        output.data[i] = 0;     // r
        output.data[i + 1] = 0; // g
        output.data[i + 2] = 0; // b
        output.data[i + 3] = 255; // a
      }
      setAnimatedOutput(output);
      setCurrentPosition({ x: 0, y: 0 });
      setIsComplete(false);
      setProgress(0);
      setAllScores([]);
      setIsPlaying(true);
    }
  }, [inputImage, templateImage]);

  const reset = useCallback(() => {
    if (inputImage && templateImage) {
      const validW = inputImage.width - templateImage.width + 1;
      const validH = inputImage.height - templateImage.height + 1;

      if (validW <= 0 || validH <= 0) {
        return;
      }

      const output = ImageProcessor.createImageData(inputImage);
      for (let i = 0; i < output.data.length; i += 4) {
        output.data[i] = 0;
        output.data[i + 1] = 0;
        output.data[i + 2] = 0;
        output.data[i + 3] = 255;
      }
      setAnimatedOutput(output);
      setCurrentPosition({ x: 0, y: 0 });
      setIsComplete(false);
      setProgress(0);
      setAllScores([]);
      setIsPlaying(false);
      lastUpdateTimeRef.current = 0;
    }
  }, [inputImage, templateImage]);

  // Reset animation when method changes mid-animation
  useEffect(() => {
    if (inputImage && templateImage && isPlaying) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  const processNextPosition = useCallback(() => {
    if (!inputImage || !templateImage || !animatedOutput || isComplete) return false;

    const validW = inputImage.width - templateImage.width + 1;
    const validH = inputImage.height - templateImage.height + 1;
    const { x, y } = currentPosition;

    // Process current position using setTimeout to avoid blocking UI
    return new Promise((resolve) => {
      setTimeout(() => {
        // Calculate match score at current position
        const result = TemplateMatchingProcessor.calculateAtPixel(
          inputImage,
          templateImage,
          method,
          x,
          y
        );

        // Store computation for display
        setComputationPosition({ x, y });
        setComputation(result);

        // Update heatmap: set pixel at (x, y) to normalized score
        const value = result.normalizedScore;
        ImageProcessor.setPixel(animatedOutput, x, y, {
          r: value,
          g: value,
          b: value,
          a: 255
        });

        // Store all scores for dynamic threshold filtering
        setAllScores(prev => [...prev, { x, y, score: value }]);

        // Advance to next position (raster scan order: left-to-right, top-to-bottom)
        let nextX = x + 1;
        let nextY = y;

        if (nextX >= validW) {
          nextX = 0;
          nextY = y + 1;
        }

        // Check if we've completed the animation
        if (nextY >= validH) {
          setIsComplete(true);
          setIsPlaying(false);
          setProgress(100);
          resolve(false);
          return;
        }

        // Update current position and progress
        setCurrentPosition({ x: nextX, y: nextY });
        const totalPositions = validW * validH;
        const currentIndex = nextY * validW + nextX;
        setProgress(Math.floor((currentIndex / totalPositions) * 100));

        // Trigger a re-render by creating a new ImageData reference
        setAnimatedOutput(new ImageData(
          new Uint8ClampedArray(animatedOutput.data),
          animatedOutput.width,
          animatedOutput.height
        ));

        resolve(true);
      }, 0);
    });
  }, [inputImage, templateImage, method, animatedOutput, currentPosition, isComplete]);

  // Animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || !inputImage || !templateImage) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    let processingFrame = false;

    const animate = (timestamp) => {
      // Calculate delay based on speed: speed 1 = 450ms delay, speed 100 = 0ms delay
      const delay = 450 - (speed - 1) * 4.5;

      if (timestamp - lastUpdateTimeRef.current >= delay && !processingFrame) {
        processingFrame = true;
        processNextPosition().then((shouldContinue) => {
          processingFrame = false;
          lastUpdateTimeRef.current = timestamp;

          if (!shouldContinue) {
            return;
          }

          if (isPlaying) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        });
      } else if (!processingFrame) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed, processNextPosition, inputImage, templateImage]);

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

  // Filter matched regions based on current threshold and limit
  const matchedRegions = useMemo(() => {
    // First filter by threshold
    let matches = allScores.filter(item => item.score >= matchThreshold);

    // If limiting to top N, sort by score (descending) and take top N
    if (limitMatches && maxMatches > 0) {
      matches = matches
        .sort((a, b) => b.score - a.score)
        .slice(0, maxMatches);
    }

    return matches;
  }, [allScores, matchThreshold, limitMatches, maxMatches]);

  return {
    isPlaying,
    speed,
    currentPosition,
    animatedOutput,
    isComplete,
    progress,
    computation,
    computationPosition,
    matchedRegions,
    matchThreshold,
    setMatchThreshold,
    limitMatches,
    setLimitMatches,
    maxMatches,
    setMaxMatches,
    allScores,
    play,
    pause,
    reset,
    setSpeed,
    togglePlayPause
  };
}
