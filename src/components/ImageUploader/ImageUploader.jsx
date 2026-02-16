import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, Image, Grid3X3 } from 'lucide-react';
import { ImageProcessor } from '../../core/ImageProcessor';
import { createGradientImage, createCheckerboard } from '../../utils/imageUtils';
import { cn } from '@/lib/utils';

function ImageUploader({ onImageLoad, imageSize = 'reduced', onImageSizeChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);

  const processFile = async (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB');
      return;
    }

    setError(null);

    try {
      const imageData = await ImageProcessor.loadImageFromFile(file);
      onImageLoad(imageData);
    } catch (err) {
      setError('Failed to load image. Please try another file.');
      console.error(err);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const loadSampleImage = async (type) => {
    setError(null);
    let imageData;

    switch (type) {
      case 'gradient': {
        imageData = createGradientImage(256, 256);
        break;
      }
      case 'checkerboard': {
        imageData = createCheckerboard(256, 256, 32);
        break;
      }
      default:
        return;
    }

    onImageLoad(imageData);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-foreground whitespace-nowrap">
          Image Size:
        </label>
        <Select value={imageSize} onValueChange={onImageSizeChange}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Tiny (32x32) - Best for pixel visualization</SelectItem>
            <SelectItem value="medium">Small (64x64)</SelectItem>
            <SelectItem value="large">Medium (128x128)</SelectItem>
            <SelectItem value="xlarge">Large (256x256)</SelectItem>
            <SelectItem value="original">Original Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <label
        className={cn(
          "flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <Upload className="h-6 w-6 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">
          Drag & drop an image or <span className="text-primary font-medium">browse</span>
        </span>
        <span className="text-xs text-muted-foreground/70">PNG, JPG, WebP (max 10MB)</span>
      </label>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-md">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="flex-1 h-px bg-border" />
        <span>or use a sample image</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => loadSampleImage('gradient')}
        >
          <Image className="h-4 w-4" />
          Gradient
        </Button>
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => loadSampleImage('checkerboard')}
        >
          <Grid3X3 className="h-4 w-4" />
          Checkerboard
        </Button>
      </div>
    </div>
  );
}

export default ImageUploader;
