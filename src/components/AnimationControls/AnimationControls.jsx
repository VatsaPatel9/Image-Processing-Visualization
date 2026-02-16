import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, RotateCcw } from 'lucide-react';

function AnimationControls({ isPlaying, onPlayPause, speed, onSpeedChange, progress, onReset }) {
  // Keyboard shortcut: Space for play/pause
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        onPlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onPlayPause]);

  return (
    <div className="flex flex-col gap-3 mt-3">
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          aria-label="Reset"
          title="Reset animation"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <label className="text-xs text-muted-foreground whitespace-nowrap">
          Speed: {speed}%
        </label>
        <Slider
          value={[speed]}
          onValueChange={(val) => onSpeedChange(val[0])}
          min={1}
          max={100}
          step={1}
          className="flex-1"
          aria-label="Animation speed"
        />
      </div>

      <div className="relative">
        <Progress value={progress} className="h-3" />
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium mix-blend-difference text-white">
          {progress}%
        </span>
      </div>
    </div>
  );
}

export default AnimationControls;
